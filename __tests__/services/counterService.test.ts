import { CounterService } from '../../src/services/counterService';
import { VisitStore } from '../../src/storage/interfaces/visitStore';
import { TimeProvider } from '../../src/services/interfaces/timeProvider';

describe('CounterService', () => {
  let mockStore: jest.Mocked<VisitStore>;
  let mockTimeProvider: jest.Mocked<TimeProvider>;
  let counterService: CounterService;

  beforeEach(() => {
    // Create mocks
    mockStore = {
      recordVisit: jest.fn(),
      getAllVisits: jest.fn(),
    };

    mockTimeProvider = {
      getCurrentTimeIso: jest.fn(),
    };

    counterService = new CounterService(mockStore, mockTimeProvider);
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

  describe('getVisitCounts', () => {
    it('should return the correct visit counts', () => {
      // Arrange
      const visits = [
        { timestamp: '2024-01-01T00:00:00.000Z' },
        { timestamp: '2024-01-02T00:00:00.000Z' },
      ];
      mockStore.getAllVisits.mockReturnValue(visits);
    });

    it('should return the correct visit counts for today', () => {
      // Arrange

      const fixedTime = '2025-09-09T09:00:00.000Z';
      mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);
      const visits = [
        { timestamp: fixedTime },
        { timestamp: '2024-01-02T00:00:00.000Z' },
      ];
      mockStore.getAllVisits.mockReturnValue(visits);

      // Act
      const result = counterService.getVisitCounts();

      // Assert
      expect(result).toEqual({ total: 2, today: 1, last7Days: 1 });
    });
  });
  it('should return the correct visit counts for last 7 days', () => {
    // Arrange
    const fixedTime = '2025-09-09T09:00:00.000Z';
    mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);
    const visits = [
      { timestamp: '2025-09-08T09:00:00.000Z' },
      { timestamp: '2025-09-07T09:00:00.000Z' },
      { timestamp: '2025-09-06T09:00:00.000Z' },
      { timestamp: '2025-09-05T09:00:00.000Z' },
      { timestamp: '2025-09-04T09:00:00.000Z' },
      { timestamp: '2025-09-03T09:00:00.000Z' },
      { timestamp: '2025-09-02T09:00:00.000Z' },
      { timestamp: '2025-09-01T09:00:00.000Z' },
    ];
    mockStore.getAllVisits.mockReturnValue(visits);

    // Act
    const result = counterService.getVisitCounts();

    // Assert
    expect(result).toEqual({ total: 8, today: 0, last7Days: 7 });
  });
});
