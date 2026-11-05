import type { ReactElement } from "react";
import { cx, percent, recommendationTone } from "../lib/format";

const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? "http://localhost:5173";

interface TopBarProps {
  recommendation: string;
  confidence: number;
}

export function TopBar({ recommendation, confidence }: TopBarProps): ReactElement {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="mark" aria-hidden="true">
          SC
        </span>
        <div className="topbar__titles">
          <span className="topbar__title">Underwriting desk</span>
          <span className="topbar__sub mono">apps/assistant · @skeleton-crew/core</span>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__metric">
          <span className="topbar__metric-label">Recommendation</span>
          <span className={cx("chip", `chip--${recommendationTone(recommendation)}`)}>
            {recommendation}
          </span>
        </div>
        <div className="topbar__metric">
          <span className="topbar__metric-label">Confidence</span>
          <span className="topbar__metric-value mono">{percent(confidence)}</span>
        </div>
        <a className="topbar__link" href={LANDING_URL}>
          Landing page <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
