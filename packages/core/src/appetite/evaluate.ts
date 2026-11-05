import type { AppetiteFinding, AppetiteResult, AppetiteSeverity, Submission } from "../domain/types";
import { APPETITE_RULES } from "./rules";

const SEVERITY_RANK: Record<AppetiteSeverity, number> = { decline: 0, refer: 1, note: 2 };

/**
 * Runs every appetite rule against a submission and collapses the findings
 * into one status. Pure: same submission in, same result out.
 */
export function evaluateAppetite(submission: Submission): AppetiteResult {
  const findings: AppetiteFinding[] = [];

  for (const rule of APPETITE_RULES) {
    const evidence = rule.evaluate(submission);
    if (evidence === null) continue;
    findings.push({
      ruleId: rule.id,
      title: rule.title,
      rationale: rule.rationale,
      severity: rule.severity,
      evidence,
    });
  }

  findings.sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.ruleId.localeCompare(b.ruleId),
  );

  const status = findings.some((f) => f.severity === "decline")
    ? "decline"
    : findings.some((f) => f.severity === "refer")
      ? "refer"
      : "in-appetite";

  return { status, findings };
}
