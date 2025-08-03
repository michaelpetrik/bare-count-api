export interface Visit {
  sessionId: string;
  timestamp: string;
  country?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  language?: string;
  referrer?: string;
  screen?: string;
}
