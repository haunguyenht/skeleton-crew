import type { ReactElement } from "react";

export function CodeSample(): ReactElement {
  return (
    <section className="section section--split" id="usage">
      <div className="section__head section__head--left">
        <span className="kicker">One call</span>
        <h2 className="section__title">The whole decision is three lines of app code</h2>
        <p className="section__lede">
          No provider tree, no hooks, no context. The core is a function you import; everything the two
          apps display is a field on the object it returns.
        </p>
        <ul className="checklist">
          <li>Pure: same submission in, same decision out</li>
          <li>Testable in Node, in a browser, or in CI</li>
          <li>No network, no clock, no persistence inside the core</li>
        </ul>
      </div>

      <div className="code">
        <div className="code__bar">
          <span className="mono">apps/assistant/src/state/useDecision.ts</span>
        </div>
        <pre className="code__body">
          <code>
            <span className="tok-key">import</span> {"{ "}
            <span className="tok-fn">decide</span>
            {" } "}
            <span className="tok-key">from</span>{" "}
            <span className="tok-str">"@skeleton-crew/core"</span>;{"\n\n"}
            <span className="tok-com">// one submission, one decision</span>
            {"\n"}
            <span className="tok-key">const</span> decision = <span className="tok-fn">decide</span>
            {"(submission);\n\n"}
            decision.recommendation; <span className="tok-com">// "refer"</span>
            {"\n"}
            decision.risk.grade; <span className="tok-com">// "C"</span>
            {"\n"}
            decision.premium.suggestedPremiumUsd; <span className="tok-com">// 76_950</span>
            {"\n"}
            decision.appetite.findings[<span className="tok-num">0</span>].ruleId;{" "}
            <span className="tok-com">// "APP-003"</span>
          </code>
        </pre>
      </div>
    </section>
  );
}
