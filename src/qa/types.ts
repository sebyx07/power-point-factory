export type Severity = "error" | "warn" | "info";
export interface Finding {
  severity: Severity;
  rule: string;
  /** 1-based; 0 = deck-wide */
  slide: number;
  el?: string;
  message: string;
  /** what to change — written for the agent */
  fix?: string;
}
export const f = (severity: Severity, rule: string, slide: number, message: string, extra: { el?: string; fix?: string } = {}): Finding => ({
  severity,
  rule,
  slide,
  message,
  ...extra,
});
