import { v4 as uuidv4 } from 'uuid';

/**
 * Enterprise-level ID generator utilities
 */
export class IdGenerator {
  /**
   * Generate a unique session ID with proper UUID
   */
  static generateSessionId(): string {
    return `session_${uuidv4()}`;
  }

  /**
   * Generate a unique action ID
   */
  static generateActionId(): string {
    return `action_${uuidv4()}`;
  }

  /**
   * Generate a unique visit ID
   */
  static generateVisitId(): string {
    return `visit_${uuidv4()}`;
  }

  /**
   * Generate a raw UUID v4
   */
  static generateUuid(): string {
    return uuidv4();
  }

  /**
   * Validate if a string is a valid UUID v4
   */
  static isValidUuid(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Extract UUID from prefixed ID (e.g., "session_uuid" -> "uuid")
   */
  static extractUuid(prefixedId: string): string | null {
    const parts = prefixedId.split('_');
    if (parts.length >= 2) {
      const uuid = parts.slice(1).join('_'); // Handle multiple underscores
      return this.isValidUuid(uuid) ? uuid : null;
    }
    return null;
  }
}
