import { describe, expect, it } from "vitest";
import { GroundedAssistant } from "../src/assistant/grounded";
import type { AssistantContext } from "../src/assistant/port";
import { decide } from "../src/engine";
import type { Submission } from "../src/domain/types";
import { SAMPLE_SUBMISSIONS } from "../src/samples/submissions";

const assistant = new GroundedAssistant();

const contextFor = (index: number): AssistantContext => {
  const submission: Submission | undefined = SAMPLE_SUBMISSIONS[index];
  if (!submission) throw new Error(`missing fixture ${index}`);
  return { submission, decision: decide(submission, { decidedAt: submission.receivedAt }) };
};

const usd = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

describe("GroundedAssistant", () => {
  it("answers an appetite question with the rules that bit", async () => {
    const reply = await assistant.ask("Why is this referred?", contextFor(1));
    expect(reply.intent).toBe("appetite");
    expect(reply.citations.map((citation) => citation.id)).toContain("APP-003");
    expect(reply.answer).toContain("Vaultline Payments");
  });

  it("quotes the premium it was given rather than inventing one", async () => {
    const context = contextFor(1);
    const reply = await assistant.ask("What premium should we quote?", context);
    expect(reply.intent).toBe("premium");
    expect(reply.answer).toContain(usd(context.decision.premium.suggestedPremiumUsd));
    expect(reply.answer).toContain(usd(context.decision.premium.technicalPremiumUsd));
  });

  it("names MFA as the binding control gap when it triggers a decline", async () => {
    const reply = await assistant.ask("How can we improve the risk?", contextFor(2));
    expect(reply.intent).toBe("controls");
    expect(reply.answer).toContain("MFA");
    expect(reply.citations.map((citation) => citation.id)).toContain("APP-002");
  });

  it("lists the workflow actions when asked what to do next", async () => {
    const context = contextFor(0);
    const reply = await assistant.ask("What are the next steps for the desk?", context);
    expect(reply.intent).toBe("next-steps");
    expect(reply.answer).toContain("Recommendation: quote at desk");
    for (const action of context.decision.nextActions) {
      expect(reply.answer).toContain(action);
    }
  });

  it("falls back to a summary with lower confidence when the question is unclear", async () => {
    const reply = await assistant.ask("hello there", contextFor(0));
    expect(reply.intent).toBe("summary");
    expect(reply.confidence).toBe(0.55);
    expect(reply.answer).toContain("Northwind Analytics");
  });

  it("never emits undefined or NaN in any answer", async () => {
    const questions = [
      "why declined?",
      "risk drivers",
      "premium please",
      "what controls are missing",
      "next steps",
      "summary",
    ];
    for (const index of [0, 1, 2]) {
      for (const question of questions) {
        const reply = await assistant.ask(question, contextFor(index));
        expect(reply.answer).not.toMatch(/undefined|NaN/);
        expect(reply.answer.length).toBeGreaterThan(40);
        expect(reply.confidence).toBeGreaterThan(0);
      }
    }
  });
});
