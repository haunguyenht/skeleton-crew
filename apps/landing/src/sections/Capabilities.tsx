import type { ReactElement } from "react";

const CAPABILITIES = [
  {
    title: "Explainable by construction",
    body: "Scores, prices and findings are produced together with their reasons. The assistant can only repeat what the engine computed, so an explanation can never drift from the decision.",
  },
  {
    title: "Referral routing built in",
    body: "Every referral rule names the queue it belongs to — claims review, facultative desk, financial review, senior sign-off — and the engine emits those actions in order.",
  },
  {
    title: "Ports, not frameworks",
    body: "The assistant is an interface with a deterministic implementation behind it. A model provider can replace it without the two apps learning a new API.",
  },
  {
    title: "Typed end to end",
    body: "One shared type vocabulary from intake to audit. A renamed coverage field breaks the build, not a quarterly report.",
  },
  {
    title: "Testable without a browser",
    body: "The core is pure functions. Thirty-four specs cover the rulebook, the score bands, the pricing floor and the assistant's citations.",
  },
  {
    title: "Deployable anywhere",
    body: "Both apps are static builds. The landing page runs on GitHub Pages from a project path; the console runs behind any internal gateway.",
  },
];

export function Capabilities(): ReactElement {
  return (
    <section className="section" id="capabilities">
      <div className="section__head">
        <span className="kicker">Capabilities</span>
        <h2 className="section__title">What the core gives both apps</h2>
      </div>

      <div className="capability-grid">
        {CAPABILITIES.map((capability) => (
          <article key={capability.title} className="capability">
            <h3 className="capability__title">{capability.title}</h3>
            <p className="capability__body">{capability.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
