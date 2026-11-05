import { SAMPLE_SUBMISSIONS, decide } from "@skeleton-crew/core";
import { useMemo, useState } from "react";

const fallback = SAMPLE_SUBMISSIONS[0] as (typeof SAMPLE_SUBMISSIONS)[number];

/**
 * The app's only stateful hook. It selects a submission and runs the core's
 * single decision entry point; no screen computes underwriting logic itself.
 */
export function useDecision() {
  const [selectedId, setSelectedId] = useState(fallback.id);

  const submission = useMemo(
    () => SAMPLE_SUBMISSIONS.find((sample) => sample.id === selectedId) ?? fallback,
    [selectedId],
  );

  const decision = useMemo(
    () => decide(submission, { decidedAt: submission.receivedAt }),
    [submission],
  );

  return {
    submissions: SAMPLE_SUBMISSIONS,
    selectedId,
    select: setSelectedId,
    submission,
    decision,
  };
}
