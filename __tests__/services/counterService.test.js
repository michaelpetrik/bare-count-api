"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const counterService_1 = require("../../src/services/counterService");
describe('CounterService', () => {
    let mockStore;
    let mockTimeProvider;
    let counterService;
    beforeEach(() => {
        // Create mocks
        mockStore = {
            recordVisit: jest.fn(),
        };
        mockTimeProvider = {
            getCurrentTimeIso: jest.fn(),
        };
        counterService = new counterService_1.CounterService(mockStore, mockTimeProvider);
    });
    describe('recordVisit', () => {
        it('should record visit with correct timestamp', () => {
            // Arrange
            const fixedTime = '2024-12-25T10:00:00.000Z';
            mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);
            // Act
            counterService.recordVisit();
            // Assert
            expect(mockTimeProvider.getCurrentTimeIso).toHaveBeenCalledTimes(1);
            expect(mockStore.recordVisit).toHaveBeenCalledWith(fixedTime);
            expect(mockStore.recordVisit).toHaveBeenCalledTimes(1);
        });
        it('should handle different timestamps correctly', () => {
            // Arrange
            const firstTime = '2024-01-01T00:00:00.000Z';
            const secondTime = '2024-12-31T23:59:59.999Z';
            mockTimeProvider.getCurrentTimeIso
                .mockReturnValueOnce(firstTime)
                .mockReturnValueOnce(secondTime);
            // Act
            counterService.recordVisit();
            counterService.recordVisit();
            // Assert
            expect(mockStore.recordVisit).toHaveBeenNthCalledWith(1, firstTime);
            expect(mockStore.recordVisit).toHaveBeenNthCalledWith(2, secondTime);
            expect(mockStore.recordVisit).toHaveBeenCalledTimes(2);
        });
    });
});
