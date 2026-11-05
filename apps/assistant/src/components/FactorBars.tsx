import type { RiskFactor } from "@skeleton-crew/core";
import type { ReactElement } from "react";

const barColor = (risk: number): string =>
  risk >= 60 ? "#fb7185" : risk >= 40 ? "#fbbf24" : "#34d399";

export function FactorBars({ factors }: { factors: RiskFactor[] }): ReactElement {
  const ranked = [...factors].sort((a, b) => b.contribution - a.contribution);

  return (
    <ul className="factors">
      {ranked.map((factor) => (
        <li key={factor.id} className="factor">
          <div className="factor__head">
            <span className="factor__label">{factor.label}</span>
            <span className="factor__weight mono">{(factor.weight * 100).toFixed(0)}% weight</span>
          </div>
          <div className="factor__track" title={factor.rationale}>
            <div
              className="factor__bar"
              style={{ width: `${Math.min(100, factor.risk)}%`, background: barColor(factor.risk) }}
            />
          </div>
          <div className="factor__foot">
            <span className="factor__rationale">{factor.rationale}</span>
            <span className="factor__numbers mono">
              {factor.risk.toFixed(1)} · +{factor.contribution.toFixed(2)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
