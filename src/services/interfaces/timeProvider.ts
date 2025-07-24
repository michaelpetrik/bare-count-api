/**
 * Interface for providing current time, enabling better testability and consistency
 */
export interface TimeProvider {
  /**
   * Get current time as ISO string
   * @returns Current timestamp in ISO format
   */
  getCurrentTimeIso(): string;
}
