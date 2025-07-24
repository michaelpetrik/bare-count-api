import { TimeProvider } from '../interfaces/timeProvider';

/**
 * Default implementation of TimeProvider using system time
 */
export class DefaultTimeProvider implements TimeProvider {
  getCurrentTimeIso(): string {
    return new Date().toISOString();
  }
}
