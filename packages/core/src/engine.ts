import { evaluateAppetite } from "./appetite/evaluate";
import type {
  AppetiteFinding,
  Decision,
  Recommendation,
  Submission,
} from "./domain/types";
import { indicatePremium } from "./pricing/price";
import { scoreRisk } from "./scoring/score";

export interface DecideOptions {
  /** Injected so decisions can be replayed deterministically in tests and audit. */
  decidedAt?: string;
}

/** Who picks up a referral, keyed by the rule that raised it. */
const REFERRAL_QUEUE: Record<string, string> = {
  "APP-003": "claims review",
  "APP-004": "claims review",
  "APP-005": "loss-history review",
  "APP-006": "facultative desk",
  "APP-007": "financial review",
  "APP-009": "senior underwriter",
};

const usd = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function nextActionsFor(
  findings: AppetiteFinding[],
  recommendation: Recommendation,
  premiumUsd: number,
): string[] {
  const actions = findings.flatMap((finding) => {
    if (finding.severity === "decline") {
      return [`Decline ${finding.ruleId}: ${finding.title}.`];
    }
    if (finding.severity === "refer") {
      const queue = REFERRAL_QUEUE[finding.ruleId] ?? "underwriting review";
      return [`Route ${finding.ruleId} to ${queue} before any indication is released.`];
    }
    return [`Attach ${finding.ruleId} to the binder as a condition: ${finding.title.toLowerCase()}.`];
  });

  if (recommendation === "quote") {
    actions.push(`Release the indication at ${usd(premiumUsd)} subject to satisfactory signed proposal.`);
  } else if (recommendation === "refer") {
    actions.push(`Hold the ${usd(premiumUsd)} technical premium as the referral guidance figure.`);
  } else {
    actions.push("Return the submission to the broker with the cited evidence.");
  }

  return actions;
}

/**
 * The whole underwriting decision in one pure call: appetite, risk, price and
 * the actions that follow. Both apps call this and nothing else.
 */
export function decide(submission: Submission, options: DecideOptions = {}): Decision {
  const appetite = evaluateAppetite(submission);
  const risk = scoreRisk(submission);
  const premium = indicatePremium(submission, risk);

  const recommendation: Recommendation =
    appetite.status === "decline" ? "decline" : appetite.status === "refer" ? "refer" : "quote";

  const notes = appetite.findings.filter((finding) => finding.severity === "note").length;
  const openClaims = submission.claims.filter((claim) => claim.status === "open").length;

  const confidence = Math.round(
    Math.min(
      0.99,
      Math.max(
        0.4,
        0.95 -
          (recommendation === "decline" ? 0.2 : recommendation === "refer" ? 0.08 : 0) -
          notes * 0.02 -
          openClaims * 0.03,
      ),
    ) * 100,
  ) / 100;

  return {
    submissionId: submission.id,
    decidedAt: options.decidedAt ?? new Date().toISOString(),
    appetite,
    risk,
    premium,
    recommendation,
    confidence,
    nextActions: nextActionsFor(appetite.findings, recommendation, premium.suggestedPremiumUsd),
  };
}
