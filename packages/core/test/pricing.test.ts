import { describe, expect, it } from "vitest";
import { LINE_BASE_RATES, MIN_PREMIUM_USD } from "../src/domain/constants";
import type { Submission } from "../src/domain/types";
import { indicatePremium } from "../src/pricing/price";
import { SAMPLE_SUBMISSIONS } from "../src/samples/submissions";
import { scoreRisk } from "../src/scoring/score";

const fixture = (index: number): Submission => {
  const sample = SAMPLE_SUBMISSIONS[index];
  if (!sample) throw new Error(`missing fixture ${index}`);
  return structuredClone(sample);
};

const price = (submission: Submission) =>
  indicatePremium(submission, scoreRisk(submission));

describe("indicatePremium", () => {
  it("builds the base premium from the limit and the lead-line rate", () => {
    const submission = fixture(0);
    submission.coverage.lines = ["cyber"];
    const result = price(submission);
    expect(result.baseRatePct).toBeCloseTo(LINE_BASE_RATES.cyber * 100, 4);
    expect(result.limitUsd).toBe(submission.coverage.limitUsd);
  });

  it("returns every modifier in the breakdown", () => {
    const result = price(fixture(1));
    expect(result.modifiers).toHaveLength(5);
    for (const modifier of result.modifiers) {
      expect(modifier.label.length).toBeGreaterThan(0);
      expect(modifier.multiplier).toBeGreaterThan(0);
    }
  });

  it("charges a riskier account more than a clean one at the same limit", () => {
    const clean = fixture(0);
    const risky = fixture(0);
    risky.coverage.limitUsd = clean.coverage.limitUsd;
    risky.claims = [{ year: 2026, line: "cyber", amountReservedUsd: 400_000, status: "open" }];
    expect(price(risky).technicalPremiumUsd).toBeGreaterThan(price(clean).technicalPremiumUsd);
  });

  it("credits a larger deductible", () => {
    const thin = fixture(0);
    const fat = fixture(0);
    thin.coverage.deductibleUsd = 5_000;
    fat.coverage.deductibleUsd = 250_000;
    expect(price(fat).technicalPremiumUsd).toBeLessThan(price(thin).technicalPremiumUsd);
  });

  it("never indicates below the minimum premium", () => {
    const tiny = fixture(0);
    tiny.coverage.limitUsd = 80_000;
    tiny.coverage.deductibleUsd = 20_000;
    const result = price(tiny);
    expect(result.technicalPremiumUsd).toBeLessThan(MIN_PREMIUM_USD);
    expect(result.suggestedPremiumUsd).toBe(MIN_PREMIUM_USD);
  });

  it("rounds the suggested premium to a quotable figure", () => {
    const result = price(fixture(1));
    expect(result.suggestedPremiumUsd % 50).toBe(0);
  });

  it("applies a package discount when more than one line is requested", () => {
    const single = fixture(0);
    const multi = fixture(0);
    single.coverage.lines = ["cyber"];
    multi.coverage.lines = ["cyber", "tech-eo"];
    const packageModifier = price(multi).modifiers.find((m) => m.label.startsWith("Package"));
    expect(packageModifier?.multiplier).toBeLessThan(1);
  });
});
