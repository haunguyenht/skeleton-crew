import type { Decision, Submission } from "../domain/types";

export interface AssistantContext {
  submission: Submission;
  decision: Decision;
}

export type AssistantIntent =
  | "appetite"
  | "risk-drivers"
  | "premium"
  | "controls"
  | "next-steps"
  | "summary";

export interface AssistantCitation {
  kind: "rule" | "factor" | "premium" | "policy";
  id: string;
  label: string;
}

export interface AssistantReply {
  intent: AssistantIntent;
  answer: string;
  citations: AssistantCitation[];
  /** 0..1 — how confident the assistant is that it answered what was asked. */
  confidence: number;
}

/**
 * The only seam between the apps and "the assistant". Anything that can answer
 * a question about a decision satisfies it — today the deterministic, grounded
 * implementation, tomorrow an LLM behind the same interface with the same
 * citations. The apps never know which one they hold.
 */
export interface AssistantPort {
  ask(question: string, context: AssistantContext): Promise<AssistantReply>;
}
