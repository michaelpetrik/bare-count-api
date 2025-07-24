import { MockTimeProvider } from '../../../src/services/implementations/mockTimeProvider';

describe('MockTimeProvider', () => {
  describe('constructor', () => {
    it('should use default fixed time when no time provided', () => {
      // Arrange & Act
      const provider = new MockTimeProvider();

      // Assert
      expect(provider.getCurrentTimeIso()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should use provided fixed time', () => {
      // Arrange
      const customTime = '2024-12-25T15:30:45.123Z';

      // Act
      const provider = new MockTimeProvider(customTime);

      // Assert
      expect(provider.getCurrentTimeIso()).toBe(customTime);
    });
  });

  describe('setFixedTime', () => {
    it('should update the fixed time', () => {
      // Arrange
      const provider = new MockTimeProvider();
      const newTime = '2024-06-15T12:00:00.000Z';

      // Act
      provider.setFixedTime(newTime);

      // Assert
      expect(provider.getCurrentTimeIso()).toBe(newTime);
    });

    it('should consistently return the same time until changed', () => {
      // Arrange
      const provider = new MockTimeProvider();
      const fixedTime = '2024-03-01T08:45:30.500Z';
      provider.setFixedTime(fixedTime);

      // Act & Assert
      expect(provider.getCurrentTimeIso()).toBe(fixedTime);
      expect(provider.getCurrentTimeIso()).toBe(fixedTime);
      expect(provider.getCurrentTimeIso()).toBe(fixedTime);
    });
  });
});
