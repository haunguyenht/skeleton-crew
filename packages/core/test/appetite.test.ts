import { describe, expect, it } from "vitest";
import { evaluateAppetite } from "../src/appetite/evaluate";
import type { Submission } from "../src/domain/types";
import { SAMPLE_SUBMISSIONS } from "../src/samples/submissions";

const base = (): Submission => {
  const sample = SAMPLE_SUBMISSIONS[0];
  if (!sample) throw new Error("missing fixture");
  return structuredClone(sample);
};

const ruleIds = (submission: Submission): string[] =>
  evaluateAppetite(submission).findings.map((finding) => finding.ruleId);

describe("evaluateAppetite", () => {
  it("passes a clean, well-controlled submission", () => {
    const result = evaluateAppetite(base());
    expect(result.status).toBe("in-appetite");
    expect(result.findings).toHaveLength(0);
  });

  it("declines a jurisdiction outside delegated authority", () => {
    const submission = base();
    submission.applicant.jurisdiction = "BR";
    const result = evaluateAppetite(submission);
    expect(result.status).toBe("decline");
    expect(ruleIds(submission)).toContain("APP-001");
  });

  it("declines cyber cover without enforced MFA", () => {
    const submission = base();
    submission.controls.mfaEnforced = false;
    const result = evaluateAppetite(submission);
    expect(result.status).toBe("decline");
    expect(result.findings[0]?.ruleId).toBe("APP-002");
  });

  it("refers an account with an open claim", () => {
    const submission = base();
    submission.claims = [{ year: 2026, line: "cyber", amountReservedUsd: 40_000, status: "open" }];
    const result = evaluateAppetite(submission);
    expect(result.status).toBe("refer");
    expect(ruleIds(submission)).toContain("APP-003");
  });

  it("refers a limit above the facultative threshold", () => {
    const submission = base();
    submission.coverage.limitUsd = 15_000_000;
    expect(ruleIds(submission)).toContain("APP-006");
  });

  it("notes a thin cyber deductible without escalating", () => {
    const submission = base();
    submission.coverage.deductibleUsd = 10_000;
    const result = evaluateAppetite(submission);
    expect(result.status).toBe("in-appetite");
    expect(ruleIds(submission)).toContain("APP-010");
  });

  it("orders findings by severity, worst first", () => {
    const submission = base();
    submission.coverage.limitUsd = 15_000_000;
    submission.controls.mfaEnforced = false;
    const severities = evaluateAppetite(submission).findings.map((finding) => finding.severity);
    expect(severities[0]).toBe("decline");
    expect(severities).toContain("refer");
    expect(severities.indexOf("refer")).toBeLessThan(severities.length);
  });

  it("is deterministic and does not mutate the submission", () => {
    const submission = base();
    const snapshot = JSON.stringify(submission);
    expect(evaluateAppetite(submission)).toEqual(evaluateAppetite(submission));
    expect(JSON.stringify(submission)).toBe(snapshot);
  });
});
