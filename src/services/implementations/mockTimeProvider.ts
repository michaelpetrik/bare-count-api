import { TimeProvider } from '../interfaces/timeProvider';

/**
 * Mock implementation of TimeProvider for testing with fixed time
 */
export class MockTimeProvider implements TimeProvider {
  constructor(private fixedTime: string = '2024-01-01T00:00:00.000Z') {}

  getCurrentTimeIso(): string {
    return this.fixedTime;
  }

  /**
   * Set a different fixed time for testing
   */
  setFixedTime(time: string): void {
    this.fixedTime = time;
  }
}
