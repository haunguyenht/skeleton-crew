# Requirements — Underwriting Assistant

## Introduction

The underwriting assistant turns a commercial submission into a defensible decision: whether the
risk is inside appetite, how risky it is, what it should cost, and what the desk does next. Every
output must be explainable from the data that produced it, and every explanation must cite the rule,
factor or modifier it came from.

## Requirement 1 — Appetite evaluation

**User story:** As an underwriter, I want the delegated-authority rulebook applied consistently, so
that declines and referrals are not a matter of who picked up the file.

1. WHEN a submission is evaluated, THE system SHALL run every appetite rule against it.
2. WHEN a rule bites, THE system SHALL return its id, title, severity, rationale and an evidence
   sentence naming the facts that triggered it.
3. IF any rule with `decline` severity bites, THEN THE system SHALL report the appetite status as
   `decline`, regardless of other findings.
4. IF no decline bites but a `refer` does, THEN THE system SHALL report the status as `refer`.
5. THE system SHALL return findings ordered `decline`, then `refer`, then `note`.
6. THE system SHALL NOT mutate the submission it was given.

**Acceptance criteria**

- [x] Ten rules are applied to every submission.
- [x] Findings carry a non-empty evidence sentence.
- [x] Appetite status follows decline > refer > in-appetite.
- [x] Ordering is deterministic for equal severities (by rule id).

## Requirement 2 — Risk scoring

**User story:** As an underwriter, I want a grade I can argue with, so that a referral conversation
starts from numbers rather than adjectives.

1. WHEN a submission is scored, THE system SHALL compute six weighted factors whose weights sum to 1.
2. WHEN the factors are computed, THE system SHALL return the composite score as their weighted sum.
3. THE system SHALL assign a grade from the bands A+ (<20), A (<35), B (<50), C (<65), D (≥65).
4. WHEN a factor is returned, THE system SHALL include a rationale sentence containing the figure
   that drove it.
5. WHEN controls improve and nothing else changes, THE system SHALL NOT return a higher score.

**Acceptance criteria**

- [x] Weights sum to 1 within floating-point tolerance.
- [x] `score` equals the weighted sum of `factors` to one decimal.
- [x] An open claim raises the score versus a clean loss run.
- [x] Every factor rationale is longer than a label.

## Requirement 3 — Premium indication

**User story:** As an underwriter, I want the technical and indicated premium with every modifier
visible, so that a broker conversation is arithmetic rather than assertion.

1. WHEN a premium is indicated, THE system SHALL derive the base premium from the limit and the
   lead-line rate of the requested lines.
2. THE system SHALL apply industry, risk, deductible, loss and package modifiers.
3. WHEN the indication is returned, THE system SHALL include every modifier with its label and
   multiplier.
4. THE system SHALL NOT indicate a premium below the configured floor ($2,500).
5. THE system SHALL round the indicated premium to a $50 step.
6. IF a larger deductible is offered with all else equal, THEN THE system SHALL indicate a lower
   technical premium.

**Acceptance criteria**

- [x] Five modifiers are returned in the breakdown.
- [x] The floor applies to a small limit.
- [x] The indicated premium lands on a $50 boundary.
- [x] A weaker risk prices higher at the same limit.

## Requirement 4 — Decision synthesis

**User story:** As an underwriter, I want one object that tells me the recommendation, how much to
trust it, and what to do next.

1. WHEN the four steps complete, THE system SHALL return a recommendation of `decline`, `refer` or
   `quote` consistent with the appetite status.
2. THE system SHALL return a confidence between 0.40 and 0.99 that falls as human judgement is
   required.
3. THE system SHALL return at least one next action, naming the queue for every referral rule.
4. WHEN `decidedAt` is supplied, THE system SHALL use it instead of the current time.

**Acceptance criteria**

- [x] Decline rules produce `recommendation: "decline"` and a `Decline APP-0xx` action.
- [x] Referral actions name claims review, facultative desk, financial review or senior sign-off.
- [x] Confidence is ordered quote > refer > decline on the sample data.
- [x] Two calls with the same `decidedAt` are deep-equal.

## Requirement 5 — Grounded assistant

**User story:** As an underwriter, I want to interrogate a decision in plain language and get an
answer I can trace, so that I never quote a number the engine did not produce.

1. WHEN a question is asked, THE system SHALL classify it into one of six intents.
2. WHEN an answer is produced, THE system SHALL compose it only from the decision and submission in
   context.
3. THE system SHALL return citations naming the rule, factor or premium indication used.
4. THE system SHALL NOT emit `undefined`, `NaN` or a premium figure that differs from the decision.
5. IF the question matches no intent, THEN THE system SHALL return the summary with lower confidence.
6. THE system SHALL satisfy `AssistantPort`, so a different provider can be substituted.

**Acceptance criteria**

- [x] An appetite question cites the rules that bit.
- [x] A premium question contains the exact technical and indicated figures.
- [x] A control question names MFA as the binding gap when APP-002 fires.
- [x] No answer across any intent contains `undefined` or `NaN`.
- [x] An unmatched question falls back to summary at 0.55 confidence.

## Requirement 6 — Desk console

**User story:** As an underwriter, I want the submission, the decision and the assistant on one
screen, so that evaluating a file does not mean switching applications.

1. WHEN the console loads, THE system SHALL show the submission list, the selected submission, the
   decision and the assistant.
2. WHEN a different submission is selected, THE system SHALL recompute the decision and reset the
   conversation to a fresh summary.
3. THE system SHALL display severity as text as well as colour.
4. THE system SHALL show the decision confidence and the assistant's intent confidence separately.
5. THE system SHALL remain usable at 360 px wide without horizontal scrolling.

**Acceptance criteria**

- [x] Selecting a submission updates every panel.
- [x] Severity chips include the word decline, refer or note.
- [x] Both confidence figures are labelled.
- [x] The layout collapses to a single column below 860 px.

## Requirement 7 — Determinism and testability

1. THE core SHALL have no runtime dependencies.
2. THE core SHALL NOT read the clock, the network or storage.
3. WHEN the test suite runs, THE system SHALL verify appetite, scoring, pricing, decision and
   assistant behaviour.
4. THE sample submissions SHALL serve as both demo data and test fixtures.

**Acceptance criteria**

- [x] `packages/core/package.json` declares no dependencies.
- [x] 34 specs pass with no network access.
- [x] `pnpm typecheck` passes for all three packages.
