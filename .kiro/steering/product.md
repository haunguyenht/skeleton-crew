---
inclusion: always
---

# Product

## What Skeleton Crew is

A commercial underwriting engine with two front doors: a public marketing site and an underwriting
assistant used by the desk. The engine — not either app — is the product. Both surfaces exist to
prove that one lean, modular core can carry a public story and a working tool at the same time.

## Who it is for

- **Underwriters** at a carrier or MGA who need a defensible first-pass decision on a submission
  and an explanation they can quote to a broker.
- **Engineers** evaluating whether underwriting logic can be a small, typed, testable library
  instead of a rules spreadsheet and three integrations.
- **Reviewers** reading the repository: the architecture, the rulebook and the reasoning behind
  them should be legible in one sitting.

## The two products

| Surface                | Job                                                                  | Success looks like                                     |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| Landing (`apps/landing`) | Explain the platform and prove it, without a screenshot             | A visitor sees a real `decide()` result in the hero.   |
| Assistant (`apps/assistant`) | Take a submission, produce the decision, answer questions about it | An underwriter can defend the grade and the premium.   |

## Product principles

1. **Explainability is a feature, not a report.** Every finding, factor and modifier carries its
   own sentence at the moment it is produced.
2. **Appetite and risk are different judgements.** A submission can be low risk and still
   uninsurable. The product never collapses the two into one score.
3. **The assistant may only know what the engine knows.** No free-text invention, no uncited number.
4. **Boring where it counts.** Pure functions, deterministic output, no hidden state, no clock in
   the maths.

## Non-goals

- Binding, policy administration, billing or claims handling.
- Carrier-specific pricing tables, regulatory filings, or jurisdiction-by-jurisdiction wordings.
- A hosted model dependency. The assistant ships deterministic; a provider can be added behind
  `AssistantPort` without touching either app.
- Multi-user persistence. State today is the selected submission in one browser tab.

## Voice

Precise and plain. Underwriting vocabulary where it earns its place (`appetite`, `referral`,
`rate on line`), no insurance theatre. Copy states what the system does and what it refuses to do.
