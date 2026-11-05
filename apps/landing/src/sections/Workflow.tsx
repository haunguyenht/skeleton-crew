import type { ReactElement } from "react";

interface Step {
  index: string;
  title: string;
  body: string;
  output: string;
}

const STEPS: Step[] = [
  {
    index: "01",
    title: "Intake",
    body: "A submission arrives as one typed object: applicant, coverage, controls and a five-year loss run. Nothing downstream re-validates it.",
    output: "mfaEnforced: false",
  },
  {
    index: "02",
    title: "Appetite",
    body: "Ten declarative rules run in under a millisecond. Findings come back ordered by severity with the evidence sentence the desk quotes to the broker.",
    output: "APP-002 decline · APP-006 refer · APP-010 note",
  },
  {
    index: "03",
    title: "Score",
    body: "Six weighted factors produce a 0–100 score and a letter grade. Each factor carries its own rationale, so the grade is arguable rather than mysterious.",
    output: "score 53.7 → grade C",
  },
  {
    index: "04",
    title: "Indicate",
    body: "Limit against the lead-line rate, then every modifier in the open. One call returns the recommendation, the confidence and the desk's next actions.",
    output: 'decide() → { recommendation: "refer", confidence: 0.8 }',
  },
];

export function Workflow(): ReactElement {
  return (
    <section className="section" id="workflow">
      <div className="section__head">
        <span className="kicker">Workflow</span>
        <h2 className="section__title">Four deterministic steps, no hidden state</h2>
        <p className="section__lede">
          Appetite and risk are separate judgements on purpose: an account can score well and still be
          uninsurable under delegated authority. The engine keeps them apart and says so out loud.
        </p>
      </div>

      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step.index} className="step">
            <span className="step__index mono">{step.index}</span>
            <h3 className="step__title">{step.title}</h3>
            <p className="step__body">{step.body}</p>
            <code className="step__output">{step.output}</code>
          </li>
        ))}
      </ol>
    </section>
  );
}
