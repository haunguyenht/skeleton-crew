import { describe, expect, it } from "vitest";
import type { Submission } from "../src/domain/types";
import { decide } from "../src/engine";
import { SAMPLE_SUBMISSIONS } from "../src/samples/submissions";

const fixture = (index: number): Submission => {
  const sample = SAMPLE_SUBMISSIONS[index];
  if (!sample) throw new Error(`missing fixture ${index}`);
  return structuredClone(sample);
};

describe("decide", () => {
  it("quotes a clean submission straight through", () => {
    const decision = decide(fixture(0), { decidedAt: "2026-11-05T00:00:00.000Z" });
    expect(decision.appetite.status).toBe("in-appetite");
    expect(decision.recommendation).toBe("quote");
    expect(decision.nextActions.some((action) => action.startsWith("Release the indication"))).toBe(
      true,
    );
  });

  it("refers an account with open losses and routes it to claims review", () => {
    const decision = decide(fixture(1));
    expect(decision.recommendation).toBe("refer");
    expect(decision.nextActions.some((action) => action.includes("claims review"))).toBe(true);
  });

  it("declines a submission that trips a decline rule and names the rule", () => {
    const decision = decide(fixture(2));
    expect(decision.recommendation).toBe("decline");
    expect(decision.nextActions.some((action) => action.startsWith("Decline APP-002"))).toBe(true);
    expect(decision.nextActions.at(-1)).toContain("Return the submission to the broker");
  });

  it("is deterministic when the decision time is injected", () => {
    const first = decide(fixture(1), { decidedAt: "2026-11-05T00:00:00.000Z" });
    const second = decide(fixture(1), { decidedAt: "2026-11-05T00:00:00.000Z" });
    expect(first).toEqual(second);
    expect(first.decidedAt).toBe("2026-11-05T00:00:00.000Z");
  });

  it("lowers confidence as the decision needs more human judgement", () => {
    const quote = decide(fixture(0));
    const refer = decide(fixture(1));
    const decline = decide(fixture(2));
    expect(quote.confidence).toBeGreaterThan(refer.confidence);
    expect(refer.confidence).toBeGreaterThan(decline.confidence);
    for (const decision of [quote, refer, decline]) {
      expect(decision.confidence).toBeGreaterThanOrEqual(0.4);
      expect(decision.confidence).toBeLessThanOrEqual(0.99);
    }
  });

  it("always returns at least one next action", () => {
    for (const submission of SAMPLE_SUBMISSIONS) {
      expect(decide(submission).nextActions.length).toBeGreaterThan(0);
    }
  });
});
