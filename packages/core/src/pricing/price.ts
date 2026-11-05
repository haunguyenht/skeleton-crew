import { INDUSTRY_PROFILES, LINE_BASE_RATES, MIN_PREMIUM_USD } from "../domain/constants";
import type { PremiumComponent, PremiumIndication, Submission } from "../domain/types";
import type { RiskAssessment } from "../domain/types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const roundTo = (value: number, step: number): number => Math.round(value / step) * step;

const round4 = (value: number): number => Math.round(value * 10_000) / 10_000;

/**
 * Technical premium = limit x lead-line rate x modifiers. Every modifier is
 * returned in the breakdown, so the assistant can explain the indication
 * dollar by dollar instead of restating a total.
 */
export function indicatePremium(submission: Submission, risk: RiskAssessment): PremiumIndication {
  const { coverage, applicant, claims } = submission;

  const leadRate = Math.max(
    ...coverage.lines.map((line) => LINE_BASE_RATES[line]),
    LINE_BASE_RATES["professional-liability"],
  );

  const baseRatePct = round4(leadRate * 100);
  const basePremium = coverage.limitUsd * leadRate;

  const industryMult = INDUSTRY_PROFILES[applicant.industry].rateMultiplier;
  const riskMult = 0.75 + (risk.score / 100) * 0.75;
  const deductibleRatio = coverage.deductibleUsd / coverage.limitUsd;
  const deductibleCredit = clamp(1 - deductibleRatio * 2, 0.7, 1);
  const reserved = claims.reduce((sum, claim) => sum + claim.amountReservedUsd, 0);
  const openClaims = claims.filter((claim) => claim.status === "open").length;
  const claimsLoading = 1 + Math.min(0.6, openClaims * 0.15 + reserved / 750_000);
  const packageDiscount = coverage.lines.length > 1 ? 0.95 : 1;

  const modifiers: PremiumComponent[] = [
    { label: `Industry — ${INDUSTRY_PROFILES[applicant.industry].label}`, multiplier: industryMult },
    { label: `Risk grade ${risk.grade} (score ${risk.score.toFixed(1)})`, multiplier: round4(riskMult) },
    { label: `Deductible ${(deductibleRatio * 100).toFixed(2)}% of limit`, multiplier: round4(deductibleCredit) },
    {
      label: `Loss loading — ${claims.length} claim${claims.length === 1 ? "" : "s"}`,
      multiplier: round4(claimsLoading),
    },
    {
      label: coverage.lines.length > 1 ? `Package discount — ${coverage.lines.length} lines` : "Single line",
      multiplier: packageDiscount,
    },
  ];

  const technicalPremiumUsd = Math.round(basePremium * modifiers.reduce((m, x) => m * x.multiplier, 1));

  return {
    currency: "USD",
    limitUsd: coverage.limitUsd,
    deductibleUsd: coverage.deductibleUsd,
    baseRatePct,
    modifiers,
    technicalPremiumUsd,
    suggestedPremiumUsd: Math.max(MIN_PREMIUM_USD, roundTo(technicalPremiumUsd, 50)),
  };
}
