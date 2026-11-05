import type { ReactElement } from "react";

interface CoreModule {
  name: string;
  path: string;
  body: string;
}

const MODULES: CoreModule[] = [
  {
    name: "Domain",
    path: "packages/core/src/domain",
    body: "Submission, applicant, coverage, claims and decision types. The shared vocabulary, with no behaviour of its own.",
  },
  {
    name: "Appetite",
    path: "packages/core/src/appetite",
    body: "Ten rules, each with a severity, a rationale and an evidence string. Adding a rule is a data change, not a code rewrite.",
  },
  {
    name: "Scoring",
    path: "packages/core/src/scoring",
    body: "Six weighted factors produce a 0–100 score and a letter grade, and every factor carries the sentence that explains it.",
  },
  {
    name: "Pricing",
    path: "packages/core/src/pricing",
    body: "Technical and indicated premium. Every modifier comes back in the breakdown, so no number is unexplained.",
  },
  {
    name: "Assistant port",
    path: "packages/core/src/assistant",
    body: "An interface plus a deterministic, citation-backed implementation. Swap in a model provider and the apps do not change.",
  },
  {
    name: "Engine",
    path: "packages/core/src/engine.ts",
    body: "decide() composes the modules into one pure call: recommendation, confidence, next actions, audit fields.",
  },
];

const APP_NODES = [
  { name: "apps/landing", detail: "marketing site · port 5173" },
  { name: "apps/assistant", detail: "underwriting console · port 5174" },
];

export function Architecture(): ReactElement {
  return (
    <section className="section" id="architecture">
      <div className="section__head">
        <span className="kicker">Architecture</span>
        <h2 className="section__title">One core, two surfaces</h2>
        <p className="section__lede">
          Dependencies point one way. The apps import the core; the core knows nothing about React, the
          DOM, or either app. Every judgement — appetite, score, price — lives in a package a test can
          call without a browser.
        </p>
      </div>

      <div className="arch">
        <div className="arch__row">
          {APP_NODES.map((node) => (
            <div key={node.name} className="arch__node arch__node--app">
              <span className="arch__node-name mono">{node.name}</span>
              <span className="arch__node-detail">{node.detail}</span>
            </div>
          ))}
        </div>

        <div className="arch__bus">
          <span className="mono">import &#123; decide &#125; from "@skeleton-crew/core"</span>
        </div>

        <div className="arch__node arch__node--core">
          <div className="arch__core-head">
            <span className="mono">packages/core</span>
            <span className="arch__core-badge">framework-free TypeScript</span>
          </div>
          <div className="arch__modules">
            {MODULES.slice(0, 5).map((module) => (
              <div key={module.name} className="arch__module">
                <span className="arch__module-name">{module.name}</span>
                <span className="arch__module-path mono">{module.path.split("/").slice(-1)[0]}</span>
              </div>
            ))}
          </div>
          <div className="arch__engine">
            <span className="mono">engine.ts</span>
            <span className="arch__engine-flow">
              evaluateAppetite → scoreRisk → indicatePremium → decide
            </span>
          </div>
        </div>
      </div>

      <div className="module-grid">
        {MODULES.map((module) => (
          <article key={module.name} className="module">
            <h3 className="module__name">{module.name}</h3>
            <code className="module__path">{module.path}</code>
            <p className="module__body">{module.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
