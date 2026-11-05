import type { ReactElement } from "react";

const TREE = `skeleton-crew/
├── .kiro/                     # Kiro context — public, not ignored
│   ├── steering/              # product, tech and structure guidance
│   └── specs/                 # requirements, design and tasks per feature
├── apps/
│   ├── landing/               # marketing site (Vite + React)
│   └── assistant/             # underwriting console (Vite + React)
├── packages/
│   └── core/                  # domain · appetite · scoring · pricing · assistant
│       ├── src/
│       └── test/              # 34 deterministic specs
├── docs/
│   └── architecture.md        # diagrams and module contracts
├── LICENSE                    # Apache-2.0
├── package.json               # pnpm workspace root
├── pnpm-workspace.yaml
└── README.md`;

export function Repository(): ReactElement {
  return (
    <section className="section" id="repository">
      <div className="section__head">
        <span className="kicker">Repository</span>
        <h2 className="section__title">A layout you can read in one screen</h2>
        <p className="section__lede">
          Two app folders, one core package, and the design context kept in{" "}
          <span className="mono">.kiro</span> at the root so the reasoning behind the code travels with it.
        </p>
      </div>

      <div className="tree">
        <div className="tree__bar">
          <span className="mono">$ tree -L 2 -I node_modules</span>
        </div>
        <pre className="tree__body">
          <code>{TREE}</code>
        </pre>
      </div>
    </section>
  );
}
