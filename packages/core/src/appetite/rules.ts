import { FACULTATIVE_LIMIT_USD, INDUSTRY_PROFILES, SUPPORTED_JURISDICTIONS } from "../domain/constants";
import type { Applicant, AppetiteSeverity, Submission } from "../domain/types";

export interface AppetiteRule {
  id: string;
  title: string;
  rationale: string;
  severity: AppetiteSeverity;
  /** Returns the evidence sentence when the rule bites, or null when it passes. */
  evaluate: (submission: Submission) => string | null;
}

const usd = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const requestsCyber = (submission: Submission): boolean =>
  submission.coverage.lines.includes("cyber");

const reservedTotal = (claims: Submission["claims"]): number =>
  claims.reduce((total, claim) => total + claim.amountReservedUsd, 0);

const describeApplicant = (applicant: Applicant): string =>
  `${applicant.legalName} (${INDUSTRY_PROFILES[applicant.industry].label.toLowerCase()}, ${usd(applicant.annualRevenueUsd)} revenue)`;

/**
 * Declarative appetite rules. Adding coverage for a new industry or loss
 * scenario is a data change here, never a change in the two apps.
 */
export const APPETITE_RULES: AppetiteRule[] = [
  {
    id: "APP-001",
    title: "Jurisdiction outside delegated authority",
    rationale: "Licensing is only in place for a fixed set of jurisdictions.",
    severity: "decline",
    evaluate: ({ applicant }) =>
      (SUPPORTED_JURISDICTIONS as readonly string[]).includes(applicant.jurisdiction)
        ? null
        : `${applicant.legalName} is domiciled in ${applicant.jurisdiction}, which is not one of the ${SUPPORTED_JURISDICTIONS.join(", ")} jurisdictions under delegated authority.`,
  },
  {
    id: "APP-002",
    title: "Cyber requested without enforced MFA",
    rationale: "Cyber appetite is conditional on phishing-resistant authentication.",
    severity: "decline",
    evaluate: (submission) =>
      requestsCyber(submission) && !submission.controls.mfaEnforced
        ? `${describeApplicant(submission.applicant)} requested cyber cover but does not enforce MFA on privileged and remote access.`
        : null,
  },
  {
    id: "APP-003",
    title: "Open claim on record",
    rationale: "Open losses must be reserved and reviewed before any new limit is bound.",
    severity: "refer",
    evaluate: ({ claims }) => {
      const open = claims.filter((claim) => claim.status === "open");
      if (open.length === 0) return null;
      const total = open.reduce((sum, claim) => sum + claim.amountReservedUsd, 0);
      return `${open.length} open claim${open.length > 1 ? "s" : ""} totalling ${usd(total)} still carry reserve.`;
    },
  },
  {
    id: "APP-004",
    title: "Reserved losses above tolerance",
    rationale: "Aggregate reserved losses above $250,000 exceed treaty tolerance.",
    severity: "refer",
    evaluate: ({ claims }) => {
      const total = reservedTotal(claims);
      return total > 250_000
        ? `Five-year reserved losses total ${usd(total)}, above the ${usd(250_000)} tolerance.`
        : null;
    },
  },
  {
    id: "APP-005",
    title: "Trading history under two years",
    rationale: "Accounts with no full financial year need a manual loss-history review.",
    severity: "refer",
    evaluate: ({ applicant }) =>
      applicant.yearsTrading < 2
        ? `${applicant.legalName} has traded for ${applicant.yearsTrading} year${applicant.yearsTrading === 1 ? "" : "s"}, so there is no complete financial year to rate against.`
        : null,
  },
  {
    id: "APP-006",
    title: "Limit above facultative threshold",
    rationale: "Limits above $10,000,000 require facultative support outside the programme.",
    severity: "refer",
    evaluate: ({ coverage }) =>
      coverage.limitUsd > FACULTATIVE_LIMIT_USD
        ? `Requested limit of ${usd(coverage.limitUsd)} exceeds the ${usd(FACULTATIVE_LIMIT_USD)} facultative threshold.`
        : null,
  },
  {
    id: "APP-007",
    title: "Non-positive EBITDA margin",
    rationale: "Negative or break-even earnings weaken the ability to absorb a retained loss.",
    severity: "refer",
    evaluate: ({ applicant }) =>
      applicant.ebitdaMarginPct <= 0
        ? `${applicant.legalName} reported an EBITDA margin of ${applicant.ebitdaMarginPct.toFixed(1)}%.`
        : null,
  },
  {
    id: "APP-008",
    title: "No incident response plan",
    rationale: "A documented response plan is a condition of cyber appetite below the referral threshold.",
    severity: "note",
    evaluate: (submission) =>
      requestsCyber(submission) && !submission.controls.incidentResponsePlan
        ? "No documented incident response plan was supplied with the submission."
        : null,
  },
  {
    id: "APP-009",
    title: "Large account",
    rationale: "Accounts above $250,000,000 revenue are quoted only with senior sign-off.",
    severity: "refer",
    evaluate: ({ applicant }) =>
      applicant.annualRevenueUsd > 250_000_000
        ? `Revenue of ${usd(applicant.annualRevenueUsd)} places this account above the ${usd(250_000_000)} large-account threshold.`
        : null,
  },
  {
    id: "APP-010",
    title: "Thin cyber deductible",
    rationale: "Cyber retentions below 2.5% of limit shift first-dollar frequency to the carrier.",
    severity: "note",
    evaluate: ({ coverage }) => {
      if (!coverage.lines.includes("cyber")) return null;
      const ratio = coverage.deductibleUsd / coverage.limitUsd;
      return ratio < 0.025
        ? `The ${usd(coverage.deductibleUsd)} deductible is ${(ratio * 100).toFixed(2)}% of the ${usd(coverage.limitUsd)} limit, below the 2.50% guideline.`
        : null;
    },
  },
];
