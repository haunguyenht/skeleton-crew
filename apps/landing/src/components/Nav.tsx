import type { ReactElement } from "react";

const ASSISTANT_URL = import.meta.env.VITE_ASSISTANT_URL ?? "http://localhost:5174";

const LINKS = [
  { href: "#architecture", label: "Architecture" },
  { href: "#apps", label: "Two apps" },
  { href: "#workflow", label: "Workflow" },
  { href: "#repository", label: "Repository" },
  { href: "#open-source", label: "Open source" },
];

export function Nav(): ReactElement {
  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="brand" href="#top">
          <span className="brand__mark" aria-hidden="true">
            SC
          </span>
          <span className="brand__text">
            Skeleton Crew
            <span className="brand__sub">underwriting core</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--primary btn--sm" href={ASSISTANT_URL}>
          Open the assistant
        </a>
      </div>
    </header>
  );
}

export { ASSISTANT_URL };
