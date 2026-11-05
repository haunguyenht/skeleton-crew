import type { ReactElement } from "react";
import { REPO_LINKS } from "../lib/site";

const FACTS = [
  {
    label: "License",
    value: "Apache-2.0",
    body: "Patent grant included, so a carrier or broker can fork and self-host without a legal review loop.",
    href: REPO_LINKS.license,
  },
  {
    label: "Design context",
    value: ".kiro at the root",
    body: "Steering docs and per-feature specs live in the repository, not in someone's notes. They are public and deliberately not gitignored.",
    href: REPO_LINKS.kiro,
  },
  {
    label: "Architecture",
    value: "docs/architecture.md",
    body: "Module contracts, dependency rules and the sequence a decision travels through, with diagrams kept next to the code.",
    href: REPO_LINKS.architecture,
  },
];

export function OpenSource(): ReactElement {
  return (
    <section className="section" id="open-source">
      <div className="section__head">
        <span className="kicker">Open source</span>
        <h2 className="section__title">Public by default</h2>
        <p className="section__lede">
          Underwriting logic that decides who gets covered should be inspectable. Everything here — the
          engine, the rulebook, the context files — is meant to be read and forked.
        </p>
      </div>

      <div className="facts">
        {FACTS.map((fact) => (
          <a key={fact.label} className="fact" href={fact.href}>
            <span className="fact__label">{fact.label}</span>
            <span className="fact__value">{fact.value}</span>
            <p className="fact__body">{fact.body}</p>
          </a>
        ))}
      </div>

      <div className="cta">
        <div>
          <h3 className="cta__title">Run it locally in two commands</h3>
          <p className="cta__body">
            <code>pnpm install</code>, then <code>pnpm dev</code>. The landing page comes up on 5173 and
            the assistant on 5174, both talking to the same core.
          </p>
        </div>
        <a className="btn btn--primary" href={REPO_LINKS.root}>
          View the repository
        </a>
      </div>
    </section>
  );
}
