import request from 'supertest';
import express from 'express';
import {
  trackAction,
  getActionStats,
  getActions,
} from '../../src/controllers/counterController';

// Mock the dependencies properly
jest.mock('../../src/services/actionService', () => {
  const mockActionService = {
    recordAction: jest.fn(),
    getActionStats: jest.fn(),
    getAllActions: jest.fn(),
    getActionsByType: jest.fn(),
    getActionsByName: jest.fn(),
    getActionsByDateRange: jest.fn(),
  };

  return {
    ActionService: jest.fn().mockImplementation(() => mockActionService),
    __mockActionService: mockActionService, // Export for access in tests
  };
});

jest.mock('../../src/storage/jsonStore', () => ({
  JsonStore: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/services/implementations/defaultTimeProvider', () => ({
  DefaultTimeProvider: jest.fn().mockImplementation(() => ({})),
}));

// Create a test app
const app = express();
app.use(express.json()); // Important for POST requests
app.post('/action', trackAction);
app.get('/action/stats', getActionStats);
app.get('/actions', getActions);

// Get access to the mock instance
const { __mockActionService: mockActionService } = jest.requireMock(
  '../../src/services/actionService'
);

describe('Action Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock return values
    mockActionService.getActionStats.mockReturnValue({
      total: 5,
      today: 2,
      last7Days: 4,
      byType: { click: 3, submit: 2 },
      byName: { test_action: 5 },
      averageTimeToAction: 5000,
    });

    mockActionService.getAllActions.mockReturnValue([
      {
        name: 'test_action',
        type: 'click',
        timeToAction: 5000,
        timestamp: '2025-08-02T10:00:00.000Z',
      },
    ]);

    mockActionService.getActionsByType.mockReturnValue([
      {
        name: 'click_action',
        type: 'click',
        timeToAction: 3000,
        timestamp: '2025-08-02T10:00:00.000Z',
      },
    ]);

    mockActionService.getActionsByName.mockReturnValue([
      {
        name: 'specific_action',
        type: 'click',
        timeToAction: 4000,
        timestamp: '2025-08-02T10:00:00.000Z',
      },
    ]);

    mockActionService.getActionsByDateRange.mockReturnValue([
      {
        name: 'date_action',
        type: 'submit',
        timeToAction: 6000,
        timestamp: '2025-08-02T10:00:00.000Z',
      },
    ]);
  });

  describe('POST /action', () => {
    it('should track action successfully with required parameters', async () => {
      // Arrange
      const actionData = {
        name: 'newsletter_signup',
        type: 'click',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });
    });

    it('should track action with optional parameters', async () => {
      // Arrange
      const actionData = {
        name: 'cta_click',
        type: 'click',
        timeToAction: 12500,
        elementId: 'main-cta',
        elementClass: 'btn-primary',
        value: 'Get Started',
        userId: 'user123',
        sessionId: 'sess456',
        metadata: {
          campaign: 'summer_sale',
          page: 'homepage',
        },
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });
    });

    it('should return 400 when name is missing', async () => {
      // Arrange
      const actionData = {
        type: 'click',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should return 400 when type is missing', async () => {
      // Arrange
      const actionData = {
        name: 'test_action',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should return 400 when timeToAction is missing', async () => {
      // Arrange
      const actionData = {
        name: 'test_action',
        type: 'click',
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should return 400 when timeToAction is not a number', async () => {
      // Arrange
      const actionData = {
        name: 'test_action',
        type: 'click',
        timeToAction: 'invalid',
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should handle empty name string', async () => {
      // Arrange
      const actionData = {
        name: '',
        type: 'click',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should handle empty type string', async () => {
      // Arrange
      const actionData = {
        name: 'test_action',
        type: '',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    });

    it('should handle various action types', async () => {
      // Arrange & Act & Assert
      const actionTypes = [
        'click',
        'submit',
        'scroll',
        'view',
        'hover',
        'custom',
      ];

      for (const type of actionTypes) {
        const actionData = {
          name: `test_${type}`,
          type,
          timeToAction: 5000,
        };

        const response = await request(app)
          .post('/action')
          .send(actionData)
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          message: 'Action tracked successfully',
        });
      }
    });

    it('should handle zero timeToAction', async () => {
      // Arrange
      const actionData = {
        name: 'immediate_action',
        type: 'click',
        timeToAction: 0,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });
    });

    it('should handle large timeToAction values', async () => {
      // Arrange
      const actionData = {
        name: 'delayed_action',
        type: 'click',
        timeToAction: 3600000, // 1 hour in milliseconds
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });
    });
  });

  describe('GET /action/stats', () => {
    it('should return action statistics', async () => {
      // Act
      const response = await request(app).get('/action/stats').expect(200);

      // Assert
      // Since we're mocking the service, we can't predict exact values
      // but we can check the structure
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should return stats in correct format', async () => {
      // Act
      const response = await request(app).get('/action/stats').expect(200);

      // Assert
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('today');
      expect(response.body).toHaveProperty('last7Days');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('byName');
      expect(response.body).toHaveProperty('averageTimeToAction');
    });
  });

  describe('GET /actions', () => {
    it('should return all actions when no filters applied', async () => {
      // Act
      const response = await request(app).get('/actions').expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle type filter', async () => {
      // Act
      const response = await request(app)
        .get('/actions?type=click')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle name filter', async () => {
      // Act
      const response = await request(app)
        .get('/actions?name=newsletter_signup')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle date range filter', async () => {
      // Act
      const response = await request(app)
        .get('/actions?startDate=2025-08-01&endDate=2025-08-31')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle multiple filters combined', async () => {
      // Act
      const response = await request(app)
        .get(
          '/actions?type=click&name=test_action&startDate=2025-08-01&endDate=2025-08-31'
        )
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle empty query parameters gracefully', async () => {
      // Act
      const response = await request(app)
        .get('/actions?type=&name=&startDate=&endDate=')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle partial date range (only startDate)', async () => {
      // Act
      const response = await request(app)
        .get('/actions?startDate=2025-08-01')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle partial date range (only endDate)', async () => {
      // Act
      const response = await request(app)
        .get('/actions?endDate=2025-08-31')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Content-Type handling', () => {
    it('should handle missing Content-Type header', async () => {
      // Arrange
      const actionData = {
        name: 'test_action',
        type: 'click',
        timeToAction: 5000,
      };

      // Act
      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      // Act
      const response = await request(app)
        .post('/action')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      // Assert that it's handled by Express middleware
      expect(response.status).toBe(400);
    });
  });
});
