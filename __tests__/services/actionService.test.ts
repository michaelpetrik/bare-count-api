import { ActionService } from '../../src/services/actionService';
import { ActionStore } from '../../src/storage/interfaces/actionStore';
import { TimeProvider } from '../../src/services/interfaces/timeProvider';
import { Action } from '../../src/types/action';

describe('ActionService', () => {
  let mockActionStore: jest.Mocked<ActionStore>;
  let mockTimeProvider: jest.Mocked<TimeProvider>;
  let actionService: ActionService;

  beforeEach(() => {
    // Create mocks
    mockActionStore = {
      recordAction: jest.fn(),
      getAllActions: jest.fn(),
    };

    mockTimeProvider = {
      getCurrentTimeIso: jest.fn(),
    };

    actionService = new ActionService(mockActionStore, mockTimeProvider);
  });

  describe('recordAction', () => {
    it('should record action with automatic timestamp', () => {
      // Arrange
      const fixedTime = '2025-08-02T10:00:00.000Z';
      mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);

      const actionData = {
        name: 'newsletter_signup',
        type: 'click',
        timeToAction: 5000,
        sessionId: 'test-session-1',
        elementId: 'signup-btn',
        elementClass: 'btn-signup',
        scrollPosition: 0,
        value: 'test@example.com',
      };

      const expectedAction: Action = {
        ...actionData,
        timestamp: fixedTime,
      };

      // Act
      actionService.recordAction(actionData);

      // Assert
      expect(mockActionStore.recordAction).toHaveBeenCalledWith(expectedAction);
      expect(mockActionStore.recordAction).toHaveBeenCalledTimes(1);
      expect(mockTimeProvider.getCurrentTimeIso).toHaveBeenCalledTimes(1);
    });

    it('should handle actions with metadata correctly', () => {
      // Arrange
      const fixedTime = '2025-08-02T10:00:00.000Z';
      mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);

      const actionData = {
        name: 'cta_click',
        type: 'click',
        timeToAction: 12500,
        sessionId: 'test-session-2',
        elementId: 'cta-button',
        elementClass: 'btn-cta',
        scrollPosition: 200,
        metadata: { campaign: 'summer_sale', page: 'homepage' },
        userId: 'user123',
      };

      const expectedAction: Action = {
        ...actionData,
        timestamp: fixedTime,
      };

      // Act
      actionService.recordAction(actionData);

      // Assert
      expect(mockActionStore.recordAction).toHaveBeenCalledWith(expectedAction);
    });

    it('should handle minimal action data', () => {
      // Arrange
      const fixedTime = '2025-08-02T10:00:00.000Z';
      mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);

      const minimalActionData = {
        name: 'basic_click',
        type: 'click',
        timeToAction: 1000,
        sessionId: 'test-session-3',
        elementId: 'basic-element',
        elementClass: 'btn-basic',
        scrollPosition: 100,
      };

      const expectedAction: Action = {
        ...minimalActionData,
        timestamp: fixedTime,
      };

      // Act
      actionService.recordAction(minimalActionData);

      // Assert
      expect(mockActionStore.recordAction).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe('getAllActions', () => {
    it('should return all actions from store', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'test_action',
          type: 'click',
          timeToAction: 5000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-1',
          elementId: 'test-element',
          elementClass: 'btn-test',
          scrollPosition: 0,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getAllActions();

      // Assert
      expect(result).toEqual(mockActions);
      expect(mockActionStore.getAllActions).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActionStats', () => {
    beforeEach(() => {
      const fixedTime = '2025-08-02T10:00:00.000Z';
      mockTimeProvider.getCurrentTimeIso.mockReturnValue(fixedTime);
    });

    it('should calculate stats correctly for multiple actions', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'newsletter_signup',
          type: 'click',
          timeToAction: 5000,
          timestamp: '2025-08-02T10:00:00.000Z', // today
          sessionId: 'mock-session-2',
          elementId: 'newsletter-btn',
          elementClass: 'btn-newsletter',
          scrollPosition: 100,
        },
        {
          name: 'cta_click',
          type: 'click',
          timeToAction: 15000,
          timestamp: '2025-08-02T09:00:00.000Z', // today
          sessionId: 'mock-session-3',
          elementId: 'cta-btn',
          elementClass: 'btn-cta',
          scrollPosition: 200,
        },
        {
          name: 'form_submit',
          type: 'submit',
          timeToAction: 10000,
          timestamp: '2025-08-01T10:00:00.000Z', // yesterday
          sessionId: 'mock-session-4',
          elementId: 'form-submit',
          elementClass: 'btn-submit',
          scrollPosition: 300,
        },
        {
          name: 'old_action',
          type: 'click',
          timeToAction: 8000,
          timestamp: '2025-07-20T10:00:00.000Z', // older than 7 days
          sessionId: 'mock-session-5',
          elementId: 'old-element',
          elementClass: 'btn-old',
          scrollPosition: 400,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionStats();

      // Assert
      expect(result).toEqual({
        total: 4,
        today: 2,
        last7Days: 3, // today + yesterday + old (but within 7 days from 2025-08-02)
        byType: {
          click: 3,
          submit: 1,
        },
        byName: {
          newsletter_signup: 1,
          cta_click: 1,
          form_submit: 1,
          old_action: 1,
        },
        averageTimeToAction: 9500, // (5000 + 15000 + 10000 + 8000) / 4
      });
    });

    it('should handle empty actions list', () => {
      // Arrange
      mockActionStore.getAllActions.mockReturnValue([]);

      // Act
      const result = actionService.getActionStats();

      // Assert
      expect(result).toEqual({
        total: 0,
        today: 0,
        last7Days: 0,
        byType: {},
        byName: {},
        averageTimeToAction: 0,
      });
    });

    it('should handle single action correctly', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'single_action',
          type: 'scroll',
          timeToAction: 7500,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-6',
          elementId: 'scroll-element',
          elementClass: 'scrollable',
          scrollPosition: 500,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionStats();

      // Assert
      expect(result).toEqual({
        total: 1,
        today: 1,
        last7Days: 1,
        byType: { scroll: 1 },
        byName: { single_action: 1 },
        averageTimeToAction: 7500,
      });
    });
  });

  describe('getActionsByType', () => {
    it('should filter actions by type correctly', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'click1',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-7',
          elementId: 'click1-element',
          elementClass: 'btn-click1',
          scrollPosition: 100,
        },
        {
          name: 'submit1',
          type: 'submit',
          timeToAction: 2000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-8',
          elementId: 'submit1-element',
          elementClass: 'btn-submit1',
          scrollPosition: 200,
        },
        {
          name: 'click2',
          type: 'click',
          timeToAction: 3000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-9',
          elementId: 'click2-element',
          elementClass: 'btn-click2',
          scrollPosition: 300,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionsByType('click');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('click1');
      expect(result[1].name).toBe('click2');
      expect(result.every((action) => action.type === 'click')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'click1',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-10',
          elementId: 'click1-element-2',
          elementClass: 'btn-click1-2',
          scrollPosition: 100,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionsByType('nonexistent');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getActionsByName', () => {
    it('should filter actions by name correctly', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'newsletter_signup',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-02T09:00:00.000Z',
          sessionId: 'mock-session-11',
          elementId: 'newsletter1-element',
          elementClass: 'btn-newsletter1',
          scrollPosition: 100,
        },
        {
          name: 'cta_click',
          type: 'click',
          timeToAction: 2000,
          timestamp: '2025-08-02T10:00:00.000Z',
          sessionId: 'mock-session-12',
          elementId: 'cta1-element',
          elementClass: 'btn-cta1',
          scrollPosition: 200,
        },
        {
          name: 'newsletter_signup',
          type: 'click',
          timeToAction: 3000,
          timestamp: '2025-08-02T11:00:00.000Z',
          sessionId: 'mock-session-13',
          elementId: 'newsletter2-element',
          elementClass: 'btn-newsletter2',
          scrollPosition: 300,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionsByName('newsletter_signup');

      // Assert
      expect(result).toHaveLength(2);
      expect(
        result.every((action) => action.name === 'newsletter_signup')
      ).toBe(true);
    });
  });

  describe('getActionsByDateRange', () => {
    it('should filter actions by date range correctly', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'action1',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-01T10:00:00.000Z', // within range
          sessionId: 'mock-session-14',
          elementId: 'action1-element',
          elementClass: 'btn-action1',
          scrollPosition: 100,
        },
        {
          name: 'action2',
          type: 'click',
          timeToAction: 2000,
          timestamp: '2025-08-02T10:00:00.000Z', // within range
          sessionId: 'mock-session-15',
          elementId: 'action2-element',
          elementClass: 'btn-action2',
          scrollPosition: 200,
        },
        {
          name: 'action3',
          type: 'click',
          timeToAction: 3000,
          timestamp: '2025-08-05T10:00:00.000Z', // outside range
          sessionId: 'mock-session-16',
          elementId: 'action3-element',
          elementClass: 'btn-action3',
          scrollPosition: 300,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionsByDateRange(
        '2025-08-01',
        '2025-08-03'
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('action1');
      expect(result[1].name).toBe('action2');
    });

    it('should return empty array when no actions in range', () => {
      // Arrange
      const mockActions: Action[] = [
        {
          name: 'action1',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-01T10:00:00.000Z',
          sessionId: 'mock-session-17',
          elementId: 'action1-element-2',
          elementClass: 'btn-action1-2',
          scrollPosition: 100,
        },
      ];
      mockActionStore.getAllActions.mockReturnValue(mockActions);

      // Act
      const result = actionService.getActionsByDateRange(
        '2025-09-01',
        '2025-09-30'
      );

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
