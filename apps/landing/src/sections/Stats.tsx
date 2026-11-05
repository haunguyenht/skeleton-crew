import type { ReactElement } from "react";

const STATS = [
  { value: "0", label: "runtime dependencies in the core", note: "pure functions, no I/O" },
  { value: "10", label: "declarative appetite rules", note: "data, not branches" },
  { value: "6", label: "weighted risk factors", note: "every score explains itself" },
  { value: "2", label: "apps sharing one engine", note: "landing + assistant" },
];

export function Stats(): ReactElement {
  return (
    <section className="stats" aria-label="Project at a glance">
      {STATS.map((stat) => (
        <div key={stat.label} className="stat">
          <span className="stat__value">{stat.value}</span>
          <span className="stat__label">{stat.label}</span>
          <span className="stat__note">{stat.note}</span>
        </div>
      ))}
    </section>
  );
}
