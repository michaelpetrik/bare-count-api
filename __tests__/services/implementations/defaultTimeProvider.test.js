"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultTimeProvider_1 = require("../../../src/services/implementations/defaultTimeProvider");
describe('DefaultTimeProvider', () => {
    let provider;
    beforeEach(() => {
        provider = new defaultTimeProvider_1.DefaultTimeProvider();
    });
    describe('getCurrentTimeIso', () => {
        it('should return a valid ISO string', () => {
            // Act
            const result = provider.getCurrentTimeIso();
            // Assert
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(() => new Date(result)).not.toThrow();
        });
        it('should return current time (approximately)', () => {
            // Arrange
            const before = new Date().getTime();
            // Act
            const result = provider.getCurrentTimeIso();
            const after = new Date().getTime();
            const resultTime = new Date(result).getTime();
            // Assert - should be within a reasonable range (1 second)
            expect(resultTime).toBeGreaterThanOrEqual(before - 1000);
            expect(resultTime).toBeLessThanOrEqual(after + 1000);
        });
        it('should return different times on subsequent calls', async () => {
            // Act
            const first = provider.getCurrentTimeIso();
            // Wait a tiny bit to ensure different timestamps
            await new Promise((resolve) => setTimeout(resolve, 1));
            const second = provider.getCurrentTimeIso();
            // Assert
            expect(first).not.toBe(second);
        });
    });
});
