import { LINE_LABELS, SAMPLE_SUBMISSIONS, decide } from "@skeleton-crew/core";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { cx, percent, usd } from "../lib/format";

const TAB_LABELS = ["Clean SaaS", "Open claim", "MFA gap"];

const tone = (status: string): string =>
  status === "decline" ? "decline" : status === "refer" ? "refer" : "ok";

/**
 * The hero's proof: this card is not a screenshot. It calls the same
 * `decide()` the assistant calls, in the browser, on a bundled submission.
 */
export function DecisionCard(): ReactElement {
  const [selected, setSelected] = useState(1);
  const submission = SAMPLE_SUBMISSIONS[selected] ?? SAMPLE_SUBMISSIONS[0];

  const decision = useMemo(
    () => decide(submission, { decidedAt: submission.receivedAt }),
    [submission],
  );

  const { applicant, coverage } = submission;
  const lines = coverage.lines.map((line) => LINE_LABELS[line]).join(" + ");

  return (
    <div className="decision-card">
      <div className="decision-card__tabs" role="tablist" aria-label="Sample submissions">
        {SAMPLE_SUBMISSIONS.map((sample, index) => (
          <button
            key={sample.id}
            role="tab"
            aria-selected={index === selected}
            className={cx("decision-card__tab", index === selected && "is-active")}
            onClick={() => setSelected(index)}
          >
            {TAB_LABELS[index] ?? sample.id}
          </button>
        ))}
      </div>

      <div className="decision-card__body">
        <div className="decision-card__topline">
          <span className="mono">decide(submission)</span>
          <span className={cx("chip", `chip--${tone(decision.recommendation)}`)}>
            {decision.recommendation}
          </span>
        </div>

        <h3 className="decision-card__name">{applicant.legalName}</h3>
        <p className="decision-card__meta">
          {applicant.jurisdiction} · {lines} · {usd(coverage.limitUsd)} limit
        </p>

        <div className="decision-card__readout">
          <div className="readout">
            <span className="readout__label">Risk grade</span>
            <span className={cx("readout__value", "readout__value--grade")}>{decision.risk.grade}</span>
            <span className="readout__sub">{decision.risk.score.toFixed(1)} / 100</span>
          </div>
          <div className="readout">
            <span className="readout__label">Indicated premium</span>
            <span className="readout__value">{usd(decision.premium.suggestedPremiumUsd)}</span>
            <span className="readout__sub">
              {decision.premium.baseRatePct.toFixed(2)}% base rate
            </span>
          </div>
        </div>

        <div className="decision-card__confidence">
          <div className="confidence__head">
            <span>Decision confidence</span>
            <span className="mono">{percent(decision.confidence)}</span>
          </div>
          <div className="confidence__track">
            <div className="confidence__fill" style={{ width: percent(decision.confidence) }} />
          </div>
        </div>

        <ul className="decision-card__findings">
          {decision.appetite.findings.length === 0 ? (
            <li className="finding finding--ok">
              <span className="finding__id">PASS</span>
              <span>No appetite rule triggered — quotable at desk.</span>
            </li>
          ) : (
            decision.appetite.findings.slice(0, 2).map((finding) => (
              <li key={finding.ruleId} className={cx("finding", `finding--${finding.severity}`)}>
                <span className="finding__id">{finding.ruleId}</span>
                <span>{finding.title}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <p className="decision-card__footer">
        Computed live in this browser by <span className="mono">@skeleton-crew/core</span> — no API call.
      </p>
    </div>
  );
}
