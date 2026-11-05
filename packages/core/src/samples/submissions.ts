import { decide } from "../engine";
import type { Submission } from "../domain/types";

/**
 * Three worked submissions used by both apps. They are the demo data and the
 * fixtures the tests assert against, so a change in the engine shows up as a
 * change in the app on the next render.
 */
export const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-2411-018",
    receivedAt: "2026-10-28T09:12:00.000Z",
    applicant: {
      legalName: "Northwind Analytics",
      industry: "saas",
      jurisdiction: "US",
      annualRevenueUsd: 12_400_000,
      employees: 85,
      yearsTrading: 6,
      ebitdaMarginPct: 22.5,
    },
    coverage: {
      lines: ["cyber", "tech-eo"],
      limitUsd: 3_000_000,
      deductibleUsd: 100_000,
    },
    controls: {
      mfaEnforced: true,
      encryptedBackups: true,
      incidentResponsePlan: true,
      annualSecurityTraining: true,
      endpointDetection: true,
    },
    claims: [],
  },
  {
    id: "SUB-2411-042",
    receivedAt: "2026-11-02T14:40:00.000Z",
    applicant: {
      legalName: "Vaultline Payments",
      industry: "fintech",
      jurisdiction: "SG",
      annualRevenueUsd: 92_000_000,
      employees: 340,
      yearsTrading: 3,
      ebitdaMarginPct: 8.5,
    },
    coverage: {
      lines: ["cyber", "tech-eo", "professional-liability"],
      limitUsd: 12_000_000,
      deductibleUsd: 150_000,
    },
    controls: {
      mfaEnforced: true,
      encryptedBackups: true,
      incidentResponsePlan: false,
      annualSecurityTraining: true,
      endpointDetection: false,
    },
    claims: [{ year: 2025, line: "cyber", amountReservedUsd: 180_000, status: "open" }],
  },
  {
    id: "SUB-2411-057",
    receivedAt: "2026-11-04T08:05:00.000Z",
    applicant: {
      legalName: "Meridian Fabrication",
      industry: "manufacturing",
      jurisdiction: "US",
      annualRevenueUsd: 140_000_000,
      employees: 900,
      yearsTrading: 22,
      ebitdaMarginPct: 11.2,
    },
    coverage: {
      lines: ["cyber", "professional-liability"],
      limitUsd: 5_000_000,
      deductibleUsd: 250_000,
    },
    controls: {
      mfaEnforced: false,
      encryptedBackups: true,
      incidentResponsePlan: false,
      annualSecurityTraining: true,
      endpointDetection: true,
    },
    claims: [{ year: 2023, line: "professional-liability", amountReservedUsd: 320_000, status: "closed" }],
  },
];

export const SAMPLE_DECISIONS = SAMPLE_SUBMISSIONS.map((submission) =>
  decide(submission, { decidedAt: submission.receivedAt }),
);
