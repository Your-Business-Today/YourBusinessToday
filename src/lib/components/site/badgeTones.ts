export type BadgeTone =
  | "positive"
  | "warning"
  | "negative"
  | "progress"
  | "notStarted"
  | "neutral";

export const badgeToneClasses: Record<BadgeTone, string> = {
  positive: "bg-go/10 text-go",
  warning: "bg-caution/10 text-caution",
  negative: "bg-signal/10 text-signal",
  progress: "bg-daylight/10 text-daylight",
  notStarted: "bg-etch/10 text-etch",
  neutral: "bg-carriage-raised text-chalk-subtle",
};
