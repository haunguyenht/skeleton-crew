---
inclusion: always
---

# Tech

## Stack

| Layer     | Choice                                    | Why                                                              |
| --------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Language  | TypeScript 5.9, `strict`                  | One vocabulary from intake to audit                               |
| Runtime   | Node 20.11+                               | Tooling only; the core runs anywhere                              |
| Workspace | pnpm 10 workspaces                        | Two apps, one core, one lockfile                                  |
| Apps      | Vite 7 + React 19                         | Static builds, no server, no framework in the core                |
| Tests     | Vitest 3                                  | Same transform pipeline as the apps                               |
| Styling   | Plain CSS with custom properties          | No utility framework to outrun; tokens keep both apps consistent  |

## Commands

```bash
pnpm install
pnpm dev             # both apps (landing :5173, assistant :5174)
pnpm dev:landing
pnpm dev:assistant
pnpm test            # core specs
pnpm typecheck       # every package
pnpm build           # both static builds
```

## Conventions

- **Dependency rule:** `apps/* → packages/core`, never the reverse. The core has no `dependencies`
  block, and adding one needs a design note in `docs/architecture.md` first.
- **The core ships as source.** `exports` points at `src/index.ts`; there is no build artifact to
  publish. `pnpm build` on the core is `tsc --noEmit`, and that is deliberate: typechecking is the
  build.
- **Pure by default.** No `Date.now()`, `fetch`, `localStorage` or randomness inside
  `packages/core`. Time is an input (`decidedAt`), data is an argument.
- **Explain at the source.** If a function produces a number a human will read, it also produces
  the sentence explaining it. Do not reconstruct explanations in the UI.
- **Imports** are extensionless; `verbatimModuleSyntax` is on, so type-only imports use `import type`.
- **No comments that restate code.** Comments explain a decision or a trade-off.

## Testing rules

- Every module has specs that assert behaviour, not snapshots.
- Fixtures are the sample submissions (`src/samples/submissions.ts`), so demo data and test data
  cannot drift.
- A rule, factor, band or modifier change requires a spec that fails before the change.
- The assistant spec asserts no answer ever contains `undefined` or `NaN`.

## Accessibility and performance

- Semantic landmarks, labelled controls, focus rings on every interactive element, and colour used
  alongside text (severity is never colour-only).
- No client-side routing and no data fetching: both apps are a single bundle under 260 kB with no
  network calls at runtime.

## Environment variables

| Variable              | App     | Default                 |
| --------------------- | ------- | ----------------------- |
| `VITE_ASSISTANT_URL`  | landing | `http://localhost:5174` |
| `VITE_LANDING_URL`    | assistant | `http://localhost:5173` |

Read at build time; both apps work without them.
