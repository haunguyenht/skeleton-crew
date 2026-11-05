import { GroundedAssistant } from "@skeleton-crew/core";
import type { AssistantReply, Decision, Submission } from "@skeleton-crew/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { percent } from "../lib/format";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
}

interface AssistantPanelProps {
  submission: Submission;
  decision: Decision;
}

const SUGGESTIONS = [
  "Give me the summary",
  "Explain the premium",
  "How can we improve the risk?",
  "What are the next steps?",
];

export function AssistantPanel({ submission, decision }: AssistantPanelProps): ReactElement {
  const assistant = useMemo(() => new GroundedAssistant(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const counter = useRef(0);
  const scroller = useRef<HTMLDivElement | null>(null);

  const nextId = (): string => {
    counter.current += 1;
    return `m${counter.current}`;
  };

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setBusy(true);

    void assistant.ask("Give me the summary", { submission, decision }).then((reply) => {
      if (cancelled) return;
      setMessages([{ id: nextId(), role: "assistant", text: reply.answer, reply }]);
      setBusy(false);
    });

    return () => {
      cancelled = true;
    };
  }, [assistant, submission, decision]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const ask = async (question: string): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
    setDraft("");
    setBusy(true);

    const reply = await assistant.ask(trimmed, { submission, decision });
    setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: reply.answer, reply }]);
    setBusy(false);
  };

  return (
    <aside className="col col--right">
      <header className="assistant__head">
        <div>
          <h2 className="assistant__title">Underwriting assistant</h2>
          <p className="assistant__sub mono">deterministic · cites engine output</p>
        </div>
        <span className="assistant__dot" aria-hidden="true" />
      </header>

      <div className="assistant__log" ref={scroller}>
        {messages.map((message) => (
          <article key={message.id} className={`msg msg--${message.role}`}>
            <p className="msg__text">{message.text}</p>

            {message.reply ? (
              <footer className="msg__foot">
                <span className="msg__intent mono">{message.reply.intent}</span>
                <span className="msg__confidence mono">match {percent(message.reply.confidence)}</span>
                {message.reply.citations.map((citation) => (
                  <span key={`${citation.kind}-${citation.id}`} className="citation mono">
                    {citation.kind}:{citation.id}
                  </span>
                ))}
              </footer>
            ) : null}
          </article>
        ))}

        {busy ? <p className="msg msg--thinking mono">thinking…</p> : null}
      </div>

      <div className="assistant__suggestions">
        {(decision.recommendation === "refer"
          ? ["Why is this referred?", ...SUGGESTIONS]
          : SUGGESTIONS
        ).map((suggestion) => (
          <button key={suggestion} className="suggestion" onClick={() => void ask(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <form
        className="assistant__form"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <input
          className="assistant__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about this decision…"
          aria-label="Ask the underwriting assistant"
        />
        <button className="assistant__send" type="submit" disabled={busy || draft.trim().length === 0}>
          Send
        </button>
      </form>
    </aside>
  );
}
