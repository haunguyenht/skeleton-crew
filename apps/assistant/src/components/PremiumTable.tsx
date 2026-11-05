import type { PremiumIndication } from "@skeleton-crew/core";
import type { ReactElement } from "react";
import { usd } from "../lib/format";

export function PremiumTable({ premium }: { premium: PremiumIndication }): ReactElement {
  const basePremium = Math.round((premium.limitUsd * premium.baseRatePct) / 100);
  const rateOnLine = (premium.suggestedPremiumUsd / premium.limitUsd) * 100;

  return (
    <div className="premium">
      <table className="premium__table">
        <tbody>
          <tr>
            <td>Limit of liability</td>
            <td className="mono">{usd(premium.limitUsd)}</td>
          </tr>
          <tr>
            <td>Lead-line rate</td>
            <td className="mono">{premium.baseRatePct.toFixed(2)}%</td>
          </tr>
          <tr className="premium__subtotal">
            <td>Base premium</td>
            <td className="mono">{usd(basePremium)}</td>
          </tr>
          {premium.modifiers.map((modifier) => (
            <tr key={modifier.label}>
              <td className="premium__modifier">{modifier.label}</td>
              <td className="mono">×{modifier.multiplier.toFixed(3)}</td>
            </tr>
          ))}
          <tr className="premium__subtotal">
            <td>Technical premium</td>
            <td className="mono">{usd(premium.technicalPremiumUsd)}</td>
          </tr>
          <tr className="premium__total">
            <td>Indicated premium</td>
            <td className="mono">{usd(premium.suggestedPremiumUsd)}</td>
          </tr>
        </tbody>
      </table>
      <p className="premium__foot">
        {rateOnLine.toFixed(3)}% rate on line · rounded to the nearest $50, floored at $2,500
      </p>
    </div>
  );
}
