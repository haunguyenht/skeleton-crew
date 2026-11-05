import { APPETITE_RULES } from "../appetite/rules";
import { INDUSTRY_PROFILES, LINE_LABELS } from "../domain/constants";
import type { ControlPosture, Submission } from "../domain/types";
import { scoreRisk } from "../scoring/score";
import type {
  AssistantCitation,
  AssistantContext,
  AssistantIntent,
  AssistantPort,
  AssistantReply,
} from "./port";

const INTENT_KEYWORDS: Array<{ intent: AssistantIntent; keywords: string[] }> = [
  {
    intent: "premium",
    keywords: ["premium", "price", "pricing", "rate", "cost", "how much", "indication"],
  },
  {
    intent: "controls",
    keywords: ["control", "improve", "mitigat", "mfa", "training", "backup", "gap", "strengthen"],
  },
  {
    intent: "next-steps",
    keywords: ["next step", "next", "action", "proceed", "bind", "what do i do", "route"],
  },
  {
    intent: "risk-drivers",
    keywords: ["risk", "score", "grade", "driver", "factor", "rating", "profile"],
  },
  {
    intent: "appetite",
    keywords: [
      "appetite",
      "declin",
      "refer",
      "eligib",
      "outside",
      "rule",
      "reject",
      "knock",
    ],
  },
  { intent: "summary", keywords: ["summary", "summar", "overview", "tell me", "status", "brief"] },
];

const CONTROL_LABELS: Array<{ key: keyof ControlPosture; label: string }> = [
  { key: "mfaEnforced", label: "MFA enforcement" },
  { key: "encryptedBackups", label: "encrypted backups" },
  { key: "incidentResponsePlan", label: "incident response plan" },
  { key: "annualSecurityTraining", label: "annual security training" },
  { key: "endpointDetection", label: "endpoint detection" },
];

const usd = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function detectIntent(question: string): { intent: AssistantIntent; hits: number } {
  const normalised = question.toLowerCase();
  let best: { intent: AssistantIntent; hits: number } = { intent: "summary", hits: 0 };

  for (const entry of INTENT_KEYWORDS) {
    const hits = entry.keywords.filter((keyword) => normalised.includes(keyword)).length;
    if (hits > best.hits) best = { intent: entry.intent, hits };
  }

  return best;
}

const recommendationWord = (value: string): string =>
  value === "quote" ? "quote at desk" : value === "refer" ? "refer" : "decline";

function composeAppetite({ submission, decision }: AssistantContext): AssistantReply {
  const { appetite } = decision;
  const citations: AssistantCitation[] = appetite.findings.map((finding) => ({
    kind: "rule",
    id: finding.ruleId,
    label: finding.title,
  }));

  if (appetite.findings.length === 0) {
    return {
      intent: "appetite",
      answer: `${submission.applicant.legalName} is inside appetite. No rule in the ${APPETITE_RULES.length}-rule book bit on this submission, so the case can be quoted without referral.`,
      citations,
      confidence: 0.86,
    };
  }

  const detail = appetite.findings
    .map(
      (finding) =>
        `${finding.ruleId} (${finding.severity}) — ${finding.evidence} Why it matters: ${finding.rationale}`,
    )
    .join(" ");

  return {
    intent: "appetite",
    answer: `${submission.applicant.legalName} is not straight-through: the appetite check returns "${appetite.status}". ${detail}`,
    citations,
    confidence: 0.93,
  };
}

function composeRiskDrivers({ decision }: AssistantContext): AssistantReply {
  const ranked = [...decision.risk.factors].sort((a, b) => b.contribution - a.contribution);
  const [first, second] = ranked;
  const lightest = ranked[ranked.length - 1];

  if (!first || !second || !lightest) {
    return { intent: "risk-drivers", answer: "No factor detail is available.", citations: [], confidence: 0.4 };
  }

  return {
    intent: "risk-drivers",
    answer:
      `Risk grade ${decision.risk.grade} with a composite score of ${decision.risk.score.toFixed(1)}/100 (lower is better). ` +
      `The heaviest contributions are ${first.label} at ${first.risk.toFixed(1)}/100 carrying a ${(first.weight * 100).toFixed(0)}% weight (${first.contribution.toFixed(2)} points) and ${second.label} at ${second.risk.toFixed(1)}/100 (${second.contribution.toFixed(2)} points). ` +
      `The most benign factor is ${lightest.label} at ${lightest.risk.toFixed(1)}/100. ${first.rationale}`,
    citations: ranked.slice(0, 3).map((factor) => ({
      kind: "factor",
      id: factor.id,
      label: factor.label,
    })),
    confidence: 0.91,
  };
}

function composePremium({ decision }: AssistantContext): AssistantReply {
  const { premium } = decision;
  const rateOnLine = (premium.suggestedPremiumUsd / premium.limitUsd) * 100;
  const modifiers = premium.modifiers
    .map((modifier) => `${modifier.label} x${modifier.multiplier.toFixed(3)}`)
    .join("; ");

  return {
    intent: "premium",
    answer:
      `The lead-line rate is ${premium.baseRatePct.toFixed(2)}% of the ${usd(premium.limitUsd)} limit. ` +
      `After modifiers the technical premium is ${usd(premium.technicalPremiumUsd)}, indicated at ${usd(premium.suggestedPremiumUsd)} — a ${rateOnLine.toFixed(3)}% rate on line. ` +
      `Modifiers applied: ${modifiers}.`,
    citations: [{ kind: "premium", id: "premium-indication", label: "Premium indication" }],
    confidence: 0.94,
  };
}

function composeControls({ submission, decision }: AssistantContext): AssistantReply {
  const gaps = CONTROL_LABELS.filter((control) => !submission.controls[control.key]);
  const cyberRule = decision.appetite.findings.find((finding) => finding.ruleId === "APP-002");

  if (gaps.length === 0) {
    return {
      intent: "controls",
      answer:
        "All five control families are evidenced, so there is no control gap to close on this submission. The cyber-controls factor is already at its floor.",
      citations: [{ kind: "factor", id: "cyber-controls", label: "Cyber controls" }],
      confidence: 0.88,
    };
  }

  const hypothetical: Submission = {
    ...submission,
    controls: {
      mfaEnforced: true,
      encryptedBackups: true,
      incidentResponsePlan: true,
      annualSecurityTraining: true,
      endpointDetection: true,
    },
  };
  const after = scoreRisk(hypothetical);

  const blocker = cyberRule
    ? ` MFA is the binding gap: ${cyberRule.evidence} That is an appetite decline, so it has to be closed before the case can be quoted at all.`
    : ` Closing all ${gaps.length} gap${gaps.length === 1 ? "" : "s"} would move the composite score from ${decision.risk.score.toFixed(1)} to ${after.score.toFixed(1)} and the grade from ${decision.risk.grade} to ${after.grade}.`;

  return {
    intent: "controls",
    answer: `Missing controls: ${gaps.map((gap) => gap.label).join(", ")}.${blocker}`,
    citations: [
      ...(cyberRule ? [{ kind: "rule" as const, id: cyberRule.ruleId, label: cyberRule.title }] : []),
      { kind: "factor", id: "cyber-controls", label: "Cyber controls" },
    ],
    confidence: 0.9,
  };
}

function composeNextSteps({ decision }: AssistantContext): AssistantReply {
  return {
    intent: "next-steps",
    answer: `Recommendation: ${recommendationWord(decision.recommendation)} (confidence ${(decision.confidence * 100).toFixed(0)}%). Actions in order: ${decision.nextActions.map((action, index) => `${index + 1}. ${action}`).join(" ")}`,
    citations: [{ kind: "policy", id: "workflow", label: "Desk workflow" }],
    confidence: 0.89,
  };
}

function composeSummary({ submission, decision }: AssistantContext): AssistantReply {
  const lines = submission.coverage.lines.map((line) => LINE_LABELS[line]).join(" + ");
  const industry = INDUSTRY_PROFILES[submission.applicant.industry].label;

  return {
    intent: "summary",
    answer:
      `${submission.applicant.legalName} (${industry}, ${submission.applicant.jurisdiction}) requests ${usd(submission.coverage.limitUsd)} of ${lines} over a ${usd(submission.coverage.deductibleUsd)} deductible. ` +
      `Appetite: ${decision.appetite.status}. Risk grade ${decision.risk.grade} at ${decision.risk.score.toFixed(1)}/100. ` +
      `Indicated premium ${usd(decision.premium.suggestedPremiumUsd)}. Recommendation: ${recommendationWord(decision.recommendation)} at ${(decision.confidence * 100).toFixed(0)}% confidence.`,
    citations: [
      { kind: "rule", id: decision.appetite.findings[0]?.ruleId ?? "APP-000", label: "Appetite check" },
      { kind: "factor", id: "loss-history", label: "Loss history" },
      { kind: "premium", id: "premium-indication", label: "Premium indication" },
    ],
    confidence: 0.83,
  };
}

const COMPOSERS: Record<AssistantIntent, (context: AssistantContext) => AssistantReply> = {
  appetite: composeAppetite,
  "risk-drivers": composeRiskDrivers,
  premium: composePremium,
  controls: composeControls,
  "next-steps": composeNextSteps,
  summary: composeSummary,
};

/**
 * Deterministic, citation-backed assistant. It never invents a number: every
 * sentence is composed from the decision object it was handed, which is why it
 * can run offline, in a test, or behind a provider swap without changing the
 * apps. Confidence reflects intent match, not model certainty.
 */
export class GroundedAssistant implements AssistantPort {

  async ask(question: string, context: AssistantContext): Promise<AssistantReply> {
    const { intent, hits } = detectIntent(question);
    const reply = COMPOSERS[intent](context);
    const confidence = hits > 0 ? Math.min(0.97, 0.7 + hits * 0.08) : 0.55;

    return { ...reply, confidence: Math.round(confidence * 100) / 100 };
  }
}
