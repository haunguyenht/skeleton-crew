---
inclusion: always
---

# Structure

## Top level

```
skeleton-crew/
├── .kiro/                 # steering + specs for this repository
├── apps/
│   ├── landing/           # marketing site
│   └── assistant/         # underwriting console
├── packages/
│   └── core/              # the underwriting engine
├── docs/                  # architecture and screenshots
├── LICENSE                # Apache-2.0
├── README.md
├── package.json           # workspace root, scripts only
└── pnpm-workspace.yaml
```

Exactly two folders under `apps/`, one package under `packages/`. A third app or a second shared
package needs a written reason in `docs/architecture.md` — the layout is part of the argument.

## Inside `packages/core`

| Path        | Holds                                                         |
| ----------- | ------------------------------------------------------------- |
| `domain/`   | `types.ts` (the shared vocabulary), `constants.ts` (rate tables, thresholds) |
| `appetite/` | `rules.ts` (the rulebook as data), `evaluate.ts` (the evaluator) |
| `scoring/`  | `score.ts` (weights, factor bands, grade bands)                |
| `pricing/`  | `price.ts` (base rate, modifiers, floor, rounding)             |
| `assistant/`| `port.ts` (the interface), `grounded.ts` (the implementation)  |
| `engine.ts` | `decide()` — the only function an app must know                |
| `samples/`  | three worked submissions used as demo data and fixtures        |
| `test/`     | specs, one file per module                                     |

## Inside an app

```
apps/<name>/src/
├── main.tsx        # mount
├── App.tsx         # composition root
├── components/     # reusable pieces
├── sections/       # page-level blocks (landing only)
├── state/          # hooks that hold state (assistant only)
├── lib/            # formatting and constants
└── styles.css      # tokens + layout
```

Apps never import from another app. Shared logic goes into the core or is deleted.

## Naming

- Components: `PascalCase.tsx`, one exported component per file, named after the thing it renders.
- Hooks: `useSomething.ts` under `state/`.
- Core functions: verbs (`decide`, `evaluateAppetite`, `scoreRisk`, `indicatePremium`).
- Domain types: nouns, no `I` prefix (`Submission`, not `ISubmission`).
- CSS: block__element--modifier, tokens as custom properties on `:root`.

## Where a change goes

| Change                          | Where                                              |
| ------------------------------- | -------------------------------------------------- |
| New appetite rule               | `packages/core/src/appetite/rules.ts`              |
| New scoring factor or band      | `packages/core/src/scoring/score.ts` + `RiskFactorId` |
| Rate, threshold, jurisdiction   | `packages/core/src/domain/constants.ts`            |
| Assistant intent or wording      | `packages/core/src/assistant/grounded.ts`          |
| Presentation, layout, copy      | the relevant app                                   |
| Anything both apps display       | the core, surfaced as a `Decision` field           |
