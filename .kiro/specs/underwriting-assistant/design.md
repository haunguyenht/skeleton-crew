# Design — Underwriting Assistant

## Overview

The assistant is a pure pipeline with two consumers. `decide()` composes appetite, scoring and
pricing into one `Decision`; the console renders it and hands it to `GroundedAssistant` as the only
source of truth for conversation. Nothing in the UI computes an underwriting number, and nothing in
the assistant looks beyond its context.

```mermaid
flowchart TD
    subgraph core[packages/core]
        D[domain<br/>types + thresholds]
        A[appetite<br/>rules + evaluator]
        S[scoring<br/>weights + bands]
        P[pricing<br/>rate + modifiers]
        E[engine<br/>decide]
        AS[assistant<br/>AssistantPort + GroundedAssistant]
        D --> A --> E
        D --> S --> E
        D --> P --> E
    end
    U[apps/assistant] -->|decide(submission)| E
    U -->|ask(question, ctx)| AS
    L[apps/landing] -->|decide(sample)| E
```

## Components and interfaces

```ts
// appetite/evaluate.ts
export function evaluateAppetite(submission: Submission): AppetiteResult;

// scoring/score.ts
export function scoreRisk(submission: Submission): RiskAssessment;
export function gradeFor(score: number): RiskGrade;

// pricing/price.ts
export function indicatePremium(submission: Submission, risk: RiskAssessment): PremiumIndication;

// engine.ts
export function decide(submission: Submission, options?: DecideOptions): Decision;

// assistant/port.ts
export interface AssistantPort {
  ask(question: string, context: AssistantContext): Promise<AssistantReply>;
}
```

The rulebook is data, not code paths:

```ts
export interface AppetiteRule {
  id: string;
  title: string;
  rationale: string;
  severity: "decline" | "refer" | "note";
  evaluate: (submission: Submission) => string | null; // evidence or null
}
```

## Data models

`Submission` (applicant, coverage, controls, claims) is the input. `Decision` is the output:

```
Decision
├── submissionId, decidedAt
├── appetite    { status, findings[] }
├── risk        { score, grade, factors[] }
├── premium     { baseRatePct, modifiers[], technicalPremiumUsd, suggestedPremiumUsd }
├── recommendation  "quote" | "refer" | "decline"
├── confidence      0.40 – 0.99
└── nextActions     string[]
```

## Correctness properties

Property-based statements the implementation is expected to hold for any valid submission:

- **P1 — Score bound.** `0 ≤ risk.score ≤ 100`, since weights sum to 1 and each factor is clamped to
  0–100.
- **P2 — Score composition.** `risk.score` equals `Σ(weight × risk)` rounded to one decimal.
- **P3 — Severity precedence.** `status = decline` if any decline finding exists, else `refer` if any
  refers, else `in-appetite`.
- **P4 — Premium floor.** `suggestedPremiumUsd ≥ 2500` and `suggestedPremiumUsd % 50 = 0`.
- **P5 — Purity.** For equal inputs (including `decidedAt`), `decide` returns deep-equal output and
  never mutates its arguments.
- **P6 — Grounding.** Every numeric figure in an assistant answer appears in the `Decision` it was
  given; citations are non-empty for any intent behind a decision.

## Error handling and edge cases

| Situation                            | Behaviour                                                     |
| ------------------------------------ | ------------------------------------------------------------- |
| No claims in the loss run            | Loss factor returns its floor; evidence says "none"            |
| Multiple lines requested             | Lead-line rate is the maximum; package discount applies        |
| Limit below the premium floor        | Technical premium shown, indicated premium floored at $2,500   |
| Zero deductible / zero limit          | Deductible ratio guarded by the pricing clamp                  |
| Unrecognised question                | Summary intent at 0.55 confidence rather than a guess          |
| Submission declines on appetite       | Risk and premium are still computed and shown for the file     |

No exceptions are thrown for data the domain allows; invalid enum values are a type error, not a
runtime branch.

## Testing strategy

- Unit specs per module (appetite, scoring, pricing, engine, assistant) — 34 in total.
- Fixtures are the three sample submissions, so the demo and the tests cannot drift.
- Assertions are behavioural (ordering, monotonicity, floors, citations), not snapshot dumps.
- The assistant spec sweeps six questions × three submissions and asserts no `undefined`/`NaN`
  and a minimum answer length.

## Design decisions

**Why a pure engine instead of a service.** The decision is cheap, deterministic and stateless. A
service would add latency, a deployment unit and an operational surface for no gain. When a real
integration is needed (loss runs, sanctions), it enters as data at the app boundary, not inside the
engine.

**Why appetite and risk are separate.** They answer different questions — "may we write this?" and
"how dangerous is it?" — and the sample data contains an account that scores B and is still declined
(Meridian Fabrication). Collapsing them into one score would have hidden that.

**Why the assistant is an interface.** It lets the deterministic implementation ship now, run in
tests and in the browser, and be replaced by a hosted model later without changing either app.
Citations are the contract that makes a model safe here: it may phrase, it may not invent.

**Why two apps and one core.** The dependency rule is the architecture. If the landing page can
render a live decision, the core is genuinely decoupled from both surfaces, and a rule change
provably lands everywhere at once.
