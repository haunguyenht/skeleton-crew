# Contributing

## Setup

```bash
pnpm install
pnpm dev          # landing :5173, assistant :5174
pnpm test         # engine specs
pnpm typecheck
```

Node 20.11+ and pnpm 10.

## The one rule

Dependencies point one way: `apps/* → packages/core`. The core has no runtime dependencies and
never reads the clock, the network or storage. If a change needs any of those, it belongs in an app.

## Where things go

| Change                                  | Location                                            |
| --------------------------------------- | --------------------------------------------------- |
| Appetite rule                           | `packages/core/src/appetite/rules.ts`               |
| Scoring factor, weight or grade band    | `packages/core/src/scoring/score.ts`                |
| Rate, threshold, jurisdiction           | `packages/core/src/domain/constants.ts`             |
| Assistant intent or wording             | `packages/core/src/assistant/grounded.ts`           |
| Presentation, layout, copy              | the relevant app                                    |

Full detail in [.kiro/steering/structure.md](.kiro/steering/structure.md).

## Tests

Every change to the rulebook, the score bands, the pricing maths or the assistant needs a spec that
fails before the change and passes after it. Fixtures are the sample submissions, so demo data and
test data stay identical.

## Pull requests

- Keep the diff to one idea.
- State the behaviour change first, then the implementation.
- If you changed an assumption in the rulebook or the pricing model, say so in the description —
  those are the parts a reviewer should argue with.
- `pnpm typecheck`, `pnpm test` and `pnpm build` must pass; CI runs all three.

## License

By contributing you agree your work is licensed under [Apache-2.0](LICENSE).
