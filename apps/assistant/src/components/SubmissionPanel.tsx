import { INDUSTRY_PROFILES, LINE_LABELS } from "@skeleton-crew/core";
import type { Submission } from "@skeleton-crew/core";
import type { ReactElement } from "react";
import { compactUsd, cx, usd } from "../lib/format";

interface SubmissionPanelProps {
  submissions: Submission[];
  selectedId: string;
  onSelect: (id: string) => void;
  submission: Submission;
}

const CONTROL_LABELS: Array<{ key: keyof Submission["controls"]; label: string }> = [
  { key: "mfaEnforced", label: "MFA enforced" },
  { key: "encryptedBackups", label: "Encrypted backups" },
  { key: "incidentResponsePlan", label: "Incident response plan" },
  { key: "annualSecurityTraining", label: "Security training" },
  { key: "endpointDetection", label: "Endpoint detection" },
];

export function SubmissionPanel({
  submissions,
  selectedId,
  onSelect,
  submission,
}: SubmissionPanelProps): ReactElement {
  const { applicant, coverage, controls, claims } = submission;

  return (
    <aside className="col col--left">
      <section className="panel">
        <header className="panel__head">
          <h2 className="panel__title">Submissions</h2>
          <span className="panel__count mono">{submissions.length}</span>
        </header>

        <ul className="submission-list">
          {submissions.map((sample) => (
            <li key={sample.id}>
              <button
                className={cx("submission", sample.id === selectedId && "is-active")}
                onClick={() => onSelect(sample.id)}
                aria-current={sample.id === selectedId}
              >
                <span className="submission__name">{sample.applicant.legalName}</span>
                <span className="submission__meta mono">
                  {compactUsd(sample.coverage.limitUsd)} · {sample.applicant.jurisdiction}
                </span>
                <span className="submission__id mono">{sample.id}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2 className="panel__title">Applicant</h2>
        </header>
        <dl className="facts-list">
          <div>
            <dt>Legal name</dt>
            <dd>{applicant.legalName}</dd>
          </div>
          <div>
            <dt>Industry</dt>
            <dd>{INDUSTRY_PROFILES[applicant.industry].label}</dd>
          </div>
          <div>
            <dt>Jurisdiction</dt>
            <dd className="mono">{applicant.jurisdiction}</dd>
          </div>
          <div>
            <dt>Revenue</dt>
            <dd className="mono">{compactUsd(applicant.annualRevenueUsd)}</dd>
          </div>
          <div>
            <dt>Employees</dt>
            <dd className="mono">{applicant.employees}</dd>
          </div>
          <div>
            <dt>Years trading</dt>
            <dd className="mono">{applicant.yearsTrading}</dd>
          </div>
          <div>
            <dt>EBITDA margin</dt>
            <dd className="mono">{applicant.ebitdaMarginPct.toFixed(1)}%</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2 className="panel__title">Coverage requested</h2>
        </header>
        <ul className="line-list">
          {coverage.lines.map((line) => (
            <li key={line} className="line">
              <span className="line__name">{LINE_LABELS[line]}</span>
              <span className="line__share mono">
                {coverage.lines.length > 1 ? `1/${coverage.lines.length}` : "lead"}
              </span>
            </li>
          ))}
        </ul>
        <dl className="facts-list facts-list--tight">
          <div>
            <dt>Limit</dt>
            <dd className="mono">{usd(coverage.limitUsd)}</dd>
          </div>
          <div>
            <dt>Deductible</dt>
            <dd className="mono">{usd(coverage.deductibleUsd)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2 className="panel__title">Controls</h2>
        </header>
        <ul className="checklist">
          {CONTROL_LABELS.map((control) => {
            const present = controls[control.key];
            return (
              <li key={control.key} className={cx("check", present ? "is-on" : "is-off")}>
                <span className="check__box" aria-hidden="true">
                  {present ? "✓" : "✕"}
                </span>
                <span>{control.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2 className="panel__title">Loss run</h2>
        </header>
        {claims.length === 0 ? (
          <p className="empty">No claims in five years.</p>
        ) : (
          <table className="mini-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Line</th>
                <th>Reserved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={`${claim.year}-${claim.line}`}>
                  <td className="mono">{claim.year}</td>
                  <td>{LINE_LABELS[claim.line]}</td>
                  <td className="mono">{compactUsd(claim.amountReservedUsd)}</td>
                  <td>
                    <span className={cx("status", `status--${claim.status}`)}>{claim.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </aside>
  );
}
