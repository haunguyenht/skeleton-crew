# Tasks — Underwriting Assistant

## 1. Core foundation

- [x] 1.1 Create the pnpm workspace (`apps/*`, `packages/*`) with a TypeScript 5.9 strict base config.
- [x] 1.2 Define the domain model: `Submission`, `Applicant`, `CoverageRequest`, `ControlPosture`,
      `ClaimRecord`, `Decision` and the `RiskFactor`/`PremiumComponent` shapes.
- [x] 1.3 Put rate tables and thresholds in `domain/constants.ts`: line base rates, industry
      profiles, supported jurisdictions, facultative limit, premium floor.
- [x] 1.4 Add three worked sample submissions that double as test fixtures.

## 2. Appetite

- [x] 2.1 Model a rule as data (id, title, rationale, severity, evaluator returning evidence).
- [x] 2.2 Implement ten rules covering jurisdiction, controls, open claims, reserved losses,
      trading history, limit, EBITDA, response plan, account size and retention.
- [x] 2.3 Implement `evaluateAppetite` with severity precedence and stable ordering.
- [x] 2.4 Spec: clean pass, each decline path, referral paths, note severity, ordering, purity.

## 3. Scoring

- [x] 3.1 Define six factors and weights that sum to 1.
- [x] 3.2 Implement control coverage, loss history, financial, industry, maturity and stretch scoring,
      each with a rationale sentence.
- [x] 3.3 Implement `gradeFor` bands (A+ / A / B / C / D).
- [x] 3.4 Spec: weight sum, composition, control monotonicity, claim monotonicity, bands, rationales.

## 4. Pricing

- [x] 4.1 Base premium from limit and lead-line rate.
- [x] 4.2 Industry, risk, deductible, loss-loading and package modifiers, all returned in the breakdown.
- [x] 4.3 Premium floor at $2,500 and rounding to a $50 step.
- [x] 4.4 Spec: base maths, modifier count, risk monotonicity, deductible credit, floor, rounding,
      package discount.

## 5. Decision engine

- [x] 5.1 Compose appetite → score → price into `decide()`.
- [x] 5.2 Derive the recommendation from appetite status.
- [x] 5.3 Derive confidence from referral severity, open claims and conditions.
- [x] 5.4 Map every referral rule to its queue and emit ordered next actions.
- [x] 5.5 Accept `decidedAt` so decisions replay deterministically.
- [x] 5.6 Spec: quote/refer/decline paths, routing, determinism, confidence ordering, action presence.

## 6. Assistant

- [x] 6.1 Define `AssistantPort`, `AssistantContext`, `AssistantReply` and citation shapes.
- [x] 6.2 Implement intent detection over six intents with keyword scoring.
- [x] 6.3 Compose answers from the decision only: appetite, risk drivers, premium, controls,
      next steps, summary.
- [x] 6.4 Add a "what if" for controls: re-score with all controls evidenced to quantify the gap.
- [x] 6.5 Spec: intent routing, citation ids, exact premium figures, MFA binding gap, fallback,
      no `undefined`/`NaN`.

## 7. Apps

- [x] 7.1 Scaffold two Vite + React apps on ports 5173 and 5174, consuming the core as source.
- [x] 7.2 Landing: nav, hero with a live decision card and three switchable samples, stats strip.
- [x] 7.3 Landing: architecture diagram, two-app section, workflow, capabilities, code sample,
      repository tree, open-source section, footer.
- [x] 7.4 Assistant: submission panel (applicant, coverage, controls, loss run).
- [x] 7.5 Assistant: decision panel (verdict, gauge, premium table, findings, factor bars, actions).
- [x] 7.6 Assistant: assistant panel (summary on select, suggestions, citations, form).
- [x] 7.7 Responsive behaviour down to 360 px; severity conveyed by text as well as colour.

## 8. Repository hygiene

- [x] 8.1 `README.md`, `docs/architecture.md` with diagrams and extension recipes.
- [x] 8.2 `.kiro/` steering and spec committed at the root and not gitignored.
- [x] 8.3 Apache-2.0 `LICENSE`.
- [x] 8.4 CI workflow: install, typecheck, test, build both apps.
- [x] 8.5 `CONTRIBUTING.md` and `.editorconfig`.

## 9. Optional follow-ups

- [ ]\* 9.1 Wire `AssistantPort` to a hosted model with the decision as structured context.
- [ ]\* 9.2 Add a comparison view for two submissions side by side.
- [ ]\* 9.3 Persist decisions to an append-only audit log.
- [ ]\* 9.4 Publish the landing page to GitHub Pages on merge.
