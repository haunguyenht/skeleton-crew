import type { ReactElement } from "react";
import { ASSISTANT_URL } from "../components/Nav";

interface AppCard {
  path: string;
  title: string;
  body: string;
  points: string[];
  command: string;
  href: string;
  here?: boolean;
}

const APPS: AppCard[] = [
  {
    path: "apps/landing",
    title: "Marketing site",
    body: "The public surface: positioning, architecture and an honest demo. The hero renders a real engine decision in the browser instead of a screenshot of one.",
    points: [
      "Vite + React, composed from typed section components",
      "Imports the core and calls decide() at render time",
      "Ships as static files — any host, no server",
    ],
    command: "pnpm dev:landing",
    href: "#top",
    here: true,
  },
  {
    path: "apps/assistant",
    title: "Underwriting assistant",
    body: "Where the desk works. Load a submission, read the decision, then interrogate the reasoning in a chat that can only cite numbers the engine actually produced.",
    points: [
      "Three-column console: submission, decision, assistant",
      "Grounded assistant with rule and factor citations",
      "Referral routing, next actions and confidence",
    ],
    command: "pnpm dev:assistant",
    href: ASSISTANT_URL,
  },
];

export function Apps(): ReactElement {
  return (
    <section className="section" id="apps">
      <div className="section__head">
        <span className="kicker">Two apps</span>
        <h2 className="section__title">Two folders, one dependency direction</h2>
        <p className="section__lede">
          Each app owns its own package, build and deploy target. Neither owns any underwriting logic,
          which is why a rule change lands in both products at once.
        </p>
      </div>

      <div className="apps">
        {APPS.map((app) => (
          <article key={app.path} className="app-card">
            <header className="app-card__head">
              <code className="app-card__path">{app.path}</code>
              {app.here ? <span className="badge">you are here</span> : null}
            </header>
            <h3 className="app-card__title">{app.title}</h3>
            <p className="app-card__body">{app.body}</p>
            <ul className="app-card__points">
              {app.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <footer className="app-card__foot">
              <code className="app-card__command">$ {app.command}</code>
              <a className="app-card__link" href={app.href}>
                {app.here ? "Stay here" : "Open"} <span aria-hidden="true">→</span>
              </a>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
