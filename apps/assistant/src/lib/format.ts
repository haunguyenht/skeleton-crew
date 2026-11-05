const usd = (value: number, digits = 0): string =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const compactUsd = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return usd(value);
};

const percent = (value: number, digits = 0): string => `${(value * 100).toFixed(digits)}%`;

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const severityTone = (severity: string): "decline" | "refer" | "note" =>
  severity === "decline" ? "decline" : severity === "refer" ? "refer" : "note";

const recommendationTone = (recommendation: string): "decline" | "refer" | "ok" =>
  recommendation === "decline" ? "decline" : recommendation === "refer" ? "refer" : "ok";

const gradeColor = (grade: string): string =>
  grade === "A+" || grade === "A"
    ? "#34d399"
    : grade === "B"
      ? "#5eead4"
      : grade === "C"
        ? "#fbbf24"
        : "#fb7185";

export { compactUsd, cx, gradeColor, percent, recommendationTone, severityTone, usd };
