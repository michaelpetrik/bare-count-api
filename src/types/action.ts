export interface Action {
  timestamp: string;
  name: string;
  type: string; // 'click', 'submit', 'view', etc.
  timeToAction: number; // time in milliseconds from page load
  sessionId?: string;
  userId?: string;
  url?: string;
  elementId?: string;
  elementClass?: string;
  value?: string;
  metadata?: Record<string, any>; // for any additional parameters
  country?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
}
