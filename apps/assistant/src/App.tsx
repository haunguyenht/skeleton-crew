import type { ReactElement } from "react";
import { AssistantPanel } from "./components/AssistantPanel";
import { DecisionPanel } from "./components/DecisionPanel";
import { SubmissionPanel } from "./components/SubmissionPanel";
import { TopBar } from "./components/TopBar";
import { useDecision } from "./state/useDecision";

export default function App(): ReactElement {
  const { submissions, selectedId, select, submission, decision } = useDecision();

  return (
    <div className="shell">
      <TopBar recommendation={decision.recommendation} confidence={decision.confidence} />
      <div className="desk">
        <SubmissionPanel
          submissions={submissions}
          selectedId={selectedId}
          onSelect={select}
          submission={submission}
        />
        <DecisionPanel submission={submission} decision={decision} />
        <AssistantPanel submission={submission} decision={decision} />
      </div>
    </div>
  );
}
