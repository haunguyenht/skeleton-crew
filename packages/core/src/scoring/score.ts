import { INDUSTRY_PROFILES } from "../domain/constants";
import type {
  ControlPosture,
  RiskAssessment,
  RiskFactor,
  RiskFactorId,
  RiskGrade,
  Submission,
} from "../domain/types";

/** Weights sum to 1, so the composite score stays on a 0–100 scale. */
export const FACTOR_WEIGHTS: Record<RiskFactorId, number> = {
  "cyber-controls": 0.28,
  "loss-history": 0.24,
  "financial-strength": 0.16,
  "industry-volatility": 0.14,
  maturity: 0.1,
  "coverage-stretch": 0.08,
};

const CONTROL_WEIGHTS: Array<{ key: keyof ControlPosture; weight: number; label: string }> = [
  { key: "mfaEnforced", weight: 0.3, label: "MFA enforced" },
  { key: "encryptedBackups", weight: 0.2, label: "encrypted backups" },
  { key: "incidentResponsePlan", weight: 0.2, label: "incident response plan" },
  { key: "annualSecurityTraining", weight: 0.15, label: "annual security training" },
  { key: "endpointDetection", weight: 0.15, label: "endpoint detection" },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const usd = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function scoreControls(controls: ControlPosture): { risk: number; rationale: string } {
  const present = CONTROL_WEIGHTS.filter((control) => controls[control.key]);
  const missing = CONTROL_WEIGHTS.filter((control) => !controls[control.key]);
  const coverage = present.reduce((sum, control) => sum + control.weight, 0);

  const rationale =
    missing.length === 0
      ? "All five control families evidenced; no control gap identified."
      : `${missing.length} of 5 control families missing: ${missing.map((control) => control.label).join(", ")}.`;

  return { risk: Math.round((1 - coverage) * 1000) / 10, rationale };
}

function scoreLossHistory(submission: Submission): { risk: number; rationale: string } {
  const open = submission.claims.filter((claim) => claim.status === "open");
  const total = submission.claims.reduce((sum, claim) => sum + claim.amountReservedUsd, 0);

  if (submission.claims.length === 0) {
    return { risk: 8, rationale: "No claims in the five-year loss run." };
  }

  const risk = clamp(open.length * 40 + Math.min(60, total / 5_000), 0, 100);
  return {
    risk: Math.round(risk * 10) / 10,
    rationale: `${submission.claims.length} claim${submission.claims.length === 1 ? "" : "s"} totalling ${usd(total)}, ${open.length} still open.`,
  };
}

function scoreFinancials(submission: Submission): { risk: number; rationale: string } {
  const margin = submission.applicant.ebitdaMarginPct;
  const risk =
    margin <= 0 ? 85 : margin < 5 ? 70 : margin < 15 ? 50 : margin < 25 ? 32 : 18;

  return { risk, rationale: `EBITDA margin of ${margin.toFixed(1)}%.` };
}

function scoreMaturity(submission: Submission): { risk: number; rationale: string } {
  const years = submission.applicant.yearsTrading;
  const risk = years < 2 ? 85 : years < 4 ? 65 : years < 7 ? 45 : years < 12 ? 28 : 14;
  return { risk, rationale: `${years} year${years === 1 ? "" : "s"} of trading history.` };
}

function scoreCoverageStretch(submission: Submission): { risk: number; rationale: string } {
  const { limitUsd, deductibleUsd } = submission.coverage;
  const revenue = submission.applicant.annualRevenueUsd;
  const stretch = limitUsd / revenue;
  const base = stretch < 0.5 ? 20 : stretch < 1 ? 35 : stretch < 2 ? 55 : stretch < 4 ? 75 : 90;
  const deductibleRatio = deductibleUsd / limitUsd;
  const penalty = deductibleRatio < 0.005 ? 15 : deductibleRatio < 0.015 ? 8 : 0;

  return {
    risk: clamp(base + penalty, 0, 100),
    rationale: `Limit is ${(stretch * 100).toFixed(0)}% of revenue with a ${(deductibleRatio * 100).toFixed(2)}% deductible${penalty > 0 ? ", a thin retention" : ""}.`,
  };
}

export function gradeFor(score: number): RiskGrade {
  if (score < 20) return "A+";
  if (score < 35) return "A";
  if (score < 50) return "B";
  if (score < 65) return "C";
  return "D";
}

/**
 * Weighted, explainable risk score. Every number the assistant cites is
 * produced here, so the explanation can never drift from the decision.
 */
export function scoreRisk(submission: Submission): RiskAssessment {
  const industry = INDUSTRY_PROFILES[submission.applicant.industry];
  const controls = scoreControls(submission.controls);
  const losses = scoreLossHistory(submission);
  const financials = scoreFinancials(submission);
  const maturity = scoreMaturity(submission);
  const stretch = scoreCoverageStretch(submission);

  const raw: Array<Omit<RiskFactor, "weight" | "contribution">> = [
    { id: "cyber-controls", label: "Cyber controls", risk: controls.risk, rationale: controls.rationale },
    { id: "loss-history", label: "Loss history", risk: losses.risk, rationale: losses.rationale },
    {
      id: "financial-strength",
      label: "Financial strength",
      risk: financials.risk,
      rationale: financials.rationale,
    },
    {
      id: "industry-volatility",
      label: "Industry volatility",
      risk: industry.volatility,
      rationale: `${industry.label} carries a benchmark volatility of ${industry.volatility}/100.`,
    },
    { id: "maturity", label: "Trading maturity", risk: maturity.risk, rationale: maturity.rationale },
    {
      id: "coverage-stretch",
      label: "Coverage stretch",
      risk: stretch.risk,
      rationale: stretch.rationale,
    },
  ];

  const factors: RiskFactor[] = raw.map((factor) => {
    const weight = FACTOR_WEIGHTS[factor.id];
    return {
      ...factor,
      risk: Math.round(factor.risk * 10) / 10,
      weight,
      contribution: Math.round(weight * factor.risk * 100) / 100,
    };
  });

  const score =
    Math.round(factors.reduce((total, factor) => total + factor.weight * factor.risk, 0) * 10) / 10;

  return { score, grade: gradeFor(score), factors };
}
