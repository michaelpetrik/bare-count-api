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
      const visitData = {
        timestamp: fixedTime,
        country: 'CZ',
        browser: 'Chrome',
        os: 'Windows',
        deviceType: 'desktop',
        language: 'cs',
        referrer: 'Direct',
        screen: '1920x1080',
      };

      // Act
      counterService.recordVisit(visitData);

      // Assert
      expect(mockStore.recordVisit).toHaveBeenCalledWith(visitData);
      expect(mockStore.recordVisit).toHaveBeenCalledTimes(1);
    });

    it('should handle different timestamps correctly', () => {
      // Arrange
      const firstTime = '2024-01-01T00:00:00.000Z';
      const secondTime = '2024-12-31T23:59:59.999Z';
      const firstVisit = {
        timestamp: firstTime,
        country: 'US',
        browser: 'Firefox',
      };
      const secondVisit = {
        timestamp: secondTime,
        country: 'DE',
        browser: 'Safari',
      };

      // Act
      counterService.recordVisit(firstVisit);
      counterService.recordVisit(secondVisit);

      // Assert
      expect(mockStore.recordVisit).toHaveBeenNthCalledWith(1, firstVisit);
      expect(mockStore.recordVisit).toHaveBeenNthCalledWith(2, secondVisit);
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
