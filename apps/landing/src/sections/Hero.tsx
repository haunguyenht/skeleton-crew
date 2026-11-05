import type { ReactElement } from "react";
import { DecisionCard } from "../components/DecisionCard";
import { ASSISTANT_URL } from "../components/Nav";

export function Hero(): ReactElement {
  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <span className="eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          Apache-2.0 · open source · zero runtime dependencies in the core
        </span>

        <h1 className="hero__title">
          Built on a lean,
          <br />
          <span className="accent">modular core</span>.
        </h1>

        <p className="hero__lede">
          Skeleton Crew is one TypeScript underwriting engine and the two products on top of it: the
          marketing surface you are reading, and the assistant where the risk work actually happens.
          Both import the same <span className="mono">decide()</span> — one implementation, two
          surfaces, no framework anywhere in the core.
        </p>

        <div className="hero__actions">
          <a className="btn btn--primary" href="#architecture">
            Read the architecture
          </a>
          <a className="btn btn--ghost" href={ASSISTANT_URL}>
            Open the assistant <span aria-hidden="true">→</span>
          </a>
        </div>

        <dl className="hero__meta">
          <div>
            <dt>Core</dt>
            <dd>framework-free TypeScript</dd>
          </div>
          <div>
            <dt>Apps</dt>
            <dd>2 separate folders</dd>
          </div>
          <div>
            <dt>Engine</dt>
            <dd>34 deterministic specs</dd>
          </div>
        </dl>
      </div>

      <div className="hero__card">
        <DecisionCard />
      </div>
    </section>
  );
}
