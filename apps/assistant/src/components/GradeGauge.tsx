import type { RiskAssessment } from "@skeleton-crew/core";
import type { ReactElement } from "react";
import { gradeColor } from "../lib/format";

export function GradeGauge({ risk }: { risk: RiskAssessment }): ReactElement {
  const color = gradeColor(risk.grade);

  return (
    <div className="gauge">
      <svg
        viewBox="0 0 160 92"
        className="gauge__svg"
        role="img"
        aria-label={`Risk grade ${risk.grade}, score ${risk.score.toFixed(1)} of 100`}
      >
        <path d="M20 80 A60 60 0 0 1 140 80" pathLength={100} className="gauge__track" />
        <path
          d="M20 80 A60 60 0 0 1 140 80"
          pathLength={100}
          className="gauge__fill"
          style={{ stroke: color, strokeDasharray: `${Math.min(100, risk.score)} 100` }}
        />
      </svg>
      <div className="gauge__caption">
        <span className="gauge__grade" style={{ color }}>
          {risk.grade}
        </span>
        <span className="gauge__score mono">{risk.score.toFixed(1)} / 100</span>
        <span className="gauge__hint">weighted across six factors</span>
      </div>
    </div>
  );
}
