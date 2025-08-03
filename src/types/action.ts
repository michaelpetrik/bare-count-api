export interface Action {
  sessionId: string;
  timestamp: string;
  name: string;
  type: string; // 'button', 'a', 'input', etc.
  timeToAction: number; // time in milliseconds from page load
  url?: string;
  elementId: string;
  elementClass: string; // for any additional parameters
  scrollPosition: number;
}
