import { describe, expect, it } from "vitest";
import type { Submission } from "../src/domain/types";
import { SAMPLE_SUBMISSIONS } from "../src/samples/submissions";
import { FACTOR_WEIGHTS, gradeFor, scoreRisk } from "../src/scoring/score";

const fixture = (index: number): Submission => {
  const sample = SAMPLE_SUBMISSIONS[index];
  if (!sample) throw new Error(`missing fixture ${index}`);
  return structuredClone(sample);
};

describe("scoreRisk", () => {
  it("weights sum to one so the score stays on a 0-100 scale", () => {
    const total = Object.values(FACTOR_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("reports the composite as the weighted sum of its factors", () => {
    const assessment = scoreRisk(fixture(1));
    const recomputed = assessment.factors.reduce(
      (sum, factor) => sum + factor.weight * factor.risk,
      0,
    );
    expect(assessment.score).toBeCloseTo(recomputed, 1);
    expect(assessment.score).toBeGreaterThan(0);
    expect(assessment.score).toBeLessThan(100);
  });

  it("charges stronger controls a lower score", () => {
    const weak = fixture(0);
    weak.controls = {
      mfaEnforced: false,
      encryptedBackups: false,
      incidentResponsePlan: false,
      annualSecurityTraining: false,
      endpointDetection: false,
    };
    expect(scoreRisk(weak).score).toBeGreaterThan(scoreRisk(fixture(0)).score);
  });

  it("scores an open claim above a clean loss run", () => {
    const clean = fixture(0);
    const withClaim = fixture(0);
    withClaim.claims = [{ year: 2026, line: "cyber", amountReservedUsd: 120_000, status: "open" }];
    expect(scoreRisk(withClaim).score).toBeGreaterThan(scoreRisk(clean).score);
  });

  it("grades a clean SaaS account A or better", () => {
    expect(["A+", "A"]).toContain(scoreRisk(fixture(0)).grade);
  });

  it("maps score bands to grades", () => {
    expect(gradeFor(0)).toBe("A+");
    expect(gradeFor(19.9)).toBe("A+");
    expect(gradeFor(20)).toBe("A");
    expect(gradeFor(35)).toBe("B");
    expect(gradeFor(50)).toBe("C");
    expect(gradeFor(65)).toBe("D");
  });

  it("explains every factor with a non-empty rationale", () => {
    for (const factor of scoreRisk(fixture(2)).factors) {
      expect(factor.rationale.length).toBeGreaterThan(10);
    }
  });
});
