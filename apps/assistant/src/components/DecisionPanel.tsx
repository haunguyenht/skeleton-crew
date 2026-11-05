import { LINE_LABELS } from "@skeleton-crew/core";
import type { Decision, Submission } from "@skeleton-crew/core";
import type { ReactElement } from "react";
import { cx, percent, recommendationTone, severityTone, usd } from "../lib/format";
import { FactorBars } from "./FactorBars";
import { GradeGauge } from "./GradeGauge";
import { PremiumTable } from "./PremiumTable";

interface DecisionPanelProps {
  submission: Submission;
  decision: Decision;
}

const plural = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function headline(decision: Decision): { title: string; body: string } {
  const declines = decision.appetite.findings.filter((f) => f.severity === "decline").length;
  const referrals = decision.appetite.findings.filter((f) => f.severity === "refer").length;
  const notes = decision.appetite.findings.filter((f) => f.severity === "note").length;

  if (decision.recommendation === "decline") {
    return {
      title: "Declined at desk",
      body: `${plural(declines, "decline rule")} stops this submission; ${plural(notes, "condition")} noted for the file.`,
    };
  }

  if (decision.recommendation === "refer") {
    return {
      title: "Referred for sign-off",
      body: `${plural(referrals, "referral rule")} and ${plural(notes, "condition")} must clear before any indication is released.`,
    };
  }

  return {
    title: "Quotable at desk",
    body: `No appetite rule bit. ${notes === 0 ? "No conditions attached." : `${plural(notes, "condition")} to attach at binding.`}`,
  };
}

export function DecisionPanel({ submission, decision }: DecisionPanelProps): ReactElement {
  const { risk, premium, appetite } = decision;
  const summary = headline(decision);
  const lines = submission.coverage.lines.map((line) => LINE_LABELS[line]).join(" + ");

  return (
    <main className="col col--center">
      <div className={cx("verdict", `verdict--${recommendationTone(decision.recommendation)}`)}>
        <div className="verdict__main">
          <span className="verdict__kicker mono">
            {submission.id} · {submission.applicant.legalName}
          </span>
          <h1 className="verdict__title">{summary.title}</h1>
          <p className="verdict__body">{summary.body}</p>
        </div>
        <div className="verdict__meta">
          <span className="verdict__meta-line">
            <span className="mono">{usd(submission.coverage.limitUsd)}</span> · {lines}
          </span>
          <span className="verdict__meta-line">
            confidence <span className="mono">{percent(decision.confidence)}</span>
          </span>
          <span className="verdict__meta-line muted mono">
            {new Date(decision.decidedAt).toISOString().slice(0, 10)}
          </span>
        </div>
      </div>

      <div className="cards">
        <section className="card">
          <header className="card__head">
            <h2 className="card__title">Risk grade</h2>
            <span className="card__hint mono">scoreRisk()</span>
          </header>
          <GradeGauge risk={risk} />
        </section>

        <section className="card">
          <header className="card__head">
            <h2 className="card__title">Premium indication</h2>
            <span className="card__hint mono">indicatePremium()</span>
          </header>
          <PremiumTable premium={premium} />
        </section>
      </div>

      <section className="card">
        <header className="card__head">
          <h2 className="card__title">Appetite findings</h2>
          <span className="card__hint mono">
            evaluateAppetite() · {appetite.findings.length} finding
            {appetite.findings.length === 1 ? "" : "s"}
          </span>
        </header>

        {appetite.findings.length === 0 ? (
          <p className="empty">No rule in the book triggered for this submission.</p>
        ) : (
          <ul className="findings">
            {appetite.findings.map((finding) => (
              <li key={finding.ruleId} className={cx("finding-row", `finding-row--${severityTone(finding.severity)}`)}>
                <div className="finding-row__head">
                  <span className="finding-row__id mono">{finding.ruleId}</span>
                  <span className={cx("chip", `chip--${severityTone(finding.severity)}`)}>
                    {finding.severity}
                  </span>
                  <span className="finding-row__title">{finding.title}</span>
                </div>
                <p className="finding-row__evidence">{finding.evidence}</p>
                <p className="finding-row__rationale">{finding.rationale}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <header className="card__head">
          <h2 className="card__title">Risk factors</h2>
          <span className="card__hint mono">ranked by contribution</span>
        </header>
        <FactorBars factors={risk.factors} />
      </section>

      <section className="card">
        <header className="card__head">
          <h2 className="card__title">Desk actions</h2>
          <span className="card__hint mono">decide().nextActions</span>
        </header>
        <ol className="actions">
          {decision.nextActions.map((action, index) => (
            <li key={action} className="action">
              <span className="action__index mono">{String(index + 1).padStart(2, "0")}</span>
              <span className="action__text">{action}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
