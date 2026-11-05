/**
 * The domain model. Deliberately small and framework-free: everything the two
 * apps need to describe a commercial submission lives here and nowhere else.
 */

export type LineOfBusiness = "cyber" | "tech-eo" | "professional-liability";

export type IndustryCode =
  | "saas"
  | "fintech"
  | "healthtech"
  | "ecommerce"
  | "manufacturing"
  | "logistics"
  | "consulting";

export interface ControlPosture {
  mfaEnforced: boolean;
  encryptedBackups: boolean;
  incidentResponsePlan: boolean;
  annualSecurityTraining: boolean;
  endpointDetection: boolean;
}

export type ClaimStatus = "open" | "closed";

export interface ClaimRecord {
  year: number;
  line: LineOfBusiness;
  amountReservedUsd: number;
  status: ClaimStatus;
}

export interface Applicant {
  legalName: string;
  industry: IndustryCode;
  jurisdiction: string;
  annualRevenueUsd: number;
  employees: number;
  yearsTrading: number;
  ebitdaMarginPct: number;
}

export interface CoverageRequest {
  lines: LineOfBusiness[];
  limitUsd: number;
  deductibleUsd: number;
}

export interface Submission {
  id: string;
  receivedAt: string;
  applicant: Applicant;
  coverage: CoverageRequest;
  controls: ControlPosture;
  claims: ClaimRecord[];
}

export type AppetiteSeverity = "decline" | "refer" | "note";

export type AppetiteStatus = "in-appetite" | "refer" | "decline";

export interface AppetiteFinding {
  ruleId: string;
  title: string;
  rationale: string;
  severity: AppetiteSeverity;
  evidence: string;
}

export interface AppetiteResult {
  status: AppetiteStatus;
  findings: AppetiteFinding[];
}

export type RiskFactorId =
  | "cyber-controls"
  | "loss-history"
  | "financial-strength"
  | "industry-volatility"
  | "maturity"
  | "coverage-stretch";

export interface RiskFactor {
  id: RiskFactorId;
  label: string;
  weight: number;
  /** 0 (benign) to 100 (severe). */
  risk: number;
  /** weight * risk — what this factor contributed to the composite score. */
  contribution: number;
  rationale: string;
}

export type RiskGrade = "A+" | "A" | "B" | "C" | "D";

export interface RiskAssessment {
  /** 0 (clean) to 100 (severe). Lower is better. */
  score: number;
  grade: RiskGrade;
  factors: RiskFactor[];
}

export interface PremiumComponent {
  label: string;
  multiplier: number;
}

export interface PremiumIndication {
  currency: "USD";
  limitUsd: number;
  deductibleUsd: number;
  baseRatePct: number;
  modifiers: PremiumComponent[];
  technicalPremiumUsd: number;
  suggestedPremiumUsd: number;
}

export type Recommendation = "quote" | "refer" | "decline";

export interface Decision {
  submissionId: string;
  decidedAt: string;
  appetite: AppetiteResult;
  risk: RiskAssessment;
  premium: PremiumIndication;
  recommendation: Recommendation;
  /** 0..1 — how much of the engine's output rests on complete, uncontested data. */
  confidence: number;
  nextActions: string[];
}
