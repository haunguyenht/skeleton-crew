import type { ReactElement } from "react";
import { REPO_LINKS } from "../lib/site";

export function Footer(): ReactElement {
  return (
    <footer className="footer">
      <div className="footer__left">
        <span className="brand__mark brand__mark--sm" aria-hidden="true">
          SC
        </span>
        <span>
          Skeleton Crew — Apache-2.0. Built with Kiro; steering docs live in{" "}
          <span className="mono">.kiro/</span>.
        </span>
      </div>

      <nav className="footer__links" aria-label="Repository links">
        <a href={REPO_LINKS.core}>Core</a>
        <a href={REPO_LINKS.landing}>Landing</a>
        <a href={REPO_LINKS.assistant}>Assistant</a>
        <a href={REPO_LINKS.architecture}>Architecture</a>
        <a href={REPO_LINKS.license}>License</a>
      </nav>
    </footer>
  );
}
