import request from 'supertest';
import fs from 'fs';
import path from 'path';

// Create isolated test app instead of using the main app
import express from 'express';
import { JsonStore } from '../../src/storage/jsonStore';
import { DefaultTimeProvider } from '../../src/services/implementations/defaultTimeProvider';
import { ActionService } from '../../src/services/actionService';
import { CounterService } from '../../src/services/counterService';

// Create test app with isolated storage
const createTestApp = (storagePath: string) => {
  const app = express();
  app.use(express.json());

  // Create isolated instances for testing
  const jsonStore = new JsonStore(storagePath);
  const timeProvider = new DefaultTimeProvider();
  const actionService = new ActionService(jsonStore, timeProvider);
  const counterService = new CounterService(jsonStore, timeProvider);

  // Import controller functions and create routes
  const trackAction = (req: any, res: any) => {
    const { name, type, timeToAction, ...additionalParams } = req.body;

    if (!name || !type || typeof timeToAction !== 'number') {
      return res.status(400).json({
        error:
          'Missing required parameters: name, type, and timeToAction are required',
      });
    }

    actionService.recordAction({
      name,
      type,
      timeToAction,
      ...additionalParams,
    });

    res.json({ success: true, message: 'Action tracked successfully' });
  };

  const getActionStats = (_req: any, res: any) => {
    const stats = actionService.getActionStats();
    res.json(stats);
  };

  const getActions = (req: any, res: any) => {
    const { type, name, startDate, endDate } = req.query;

    let actions = actionService.getAllActions();

    if (type) {
      actions = actionService.getActionsByType(type as string);
    }

    if (name) {
      actions = actionService.getActionsByName(name as string);
    }

    if (startDate && endDate) {
      actions = actionService.getActionsByDateRange(
        startDate as string,
        endDate as string
      );
    }

    res.json(actions);
  };

  app.post('/action', trackAction);
  app.get('/action/stats', getActionStats);
  app.get('/actions', getActions);

  return app;
};

// Integration test for the complete action tracking flow
describe('Action Tracking Integration', () => {
  const testStoragePath = path.join(__dirname, 'test-storage.json');
  let app: express.Express;

  beforeEach(() => {
    // Clean up test storage file
    if (fs.existsSync(testStoragePath)) {
      fs.unlinkSync(testStoragePath);
    }

    // Create isolated test app
    app = createTestApp(testStoragePath);
  });

  afterEach(() => {
    // Clean up test storage file
    if (fs.existsSync(testStoragePath)) {
      fs.unlinkSync(testStoragePath);
    }
  });

  describe('Complete Action Tracking Flow', () => {
    it('should track multiple actions and return correct statistics', async () => {
      // Track first action
      const action1 = {
        name: 'newsletter_signup',
        type: 'click',
        timeToAction: 5000,
        elementId: 'signup-btn',
        value: 'test@example.com',
      };

      const response1 = await request(app)
        .post('/action')
        .send(action1)
        .expect(200);

      expect(response1.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });

      // Track second action
      const action2 = {
        name: 'cta_click',
        type: 'click',
        timeToAction: 12500,
        elementId: 'main-cta',
        metadata: {
          campaign: 'summer_sale',
          page: 'homepage',
        },
      };

      const response2 = await request(app)
        .post('/action')
        .send(action2)
        .expect(200);

      expect(response2.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });

      // Track third action with different type
      const action3 = {
        name: 'contact_form',
        type: 'submit',
        timeToAction: 45000,
        elementId: 'contact-form',
        userId: 'user123',
      };

      const response3 = await request(app)
        .post('/action')
        .send(action3)
        .expect(200);

      expect(response3.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });

      // Get statistics
      const statsResponse = await request(app).get('/action/stats').expect(200);

      expect(statsResponse.body).toMatchObject({
        total: 3,
        today: 3,
        last7Days: 3,
        byType: {
          click: 2,
          submit: 1,
        },
        byName: {
          newsletter_signup: 1,
          cta_click: 1,
          contact_form: 1,
        },
      });

      // Check average time calculation
      const expectedAverage = (5000 + 12500 + 45000) / 3;
      expect(statsResponse.body.averageTimeToAction).toBeCloseTo(
        expectedAverage,
        2
      );

      // Get all actions
      const actionsResponse = await request(app).get('/actions').expect(200);

      expect(actionsResponse.body).toHaveLength(3);
      expect(actionsResponse.body[0]).toMatchObject({
        name: 'newsletter_signup',
        type: 'click',
        timeToAction: 5000,
        elementId: 'signup-btn',
        value: 'test@example.com',
      });
      expect(actionsResponse.body[0]).toHaveProperty('timestamp');
    });

    it('should filter actions correctly', async () => {
      // Track multiple actions with different types
      const actions = [
        {
          name: 'click_action_1',
          type: 'click',
          timeToAction: 1000,
        },
        {
          name: 'click_action_2',
          type: 'click',
          timeToAction: 2000,
        },
        {
          name: 'submit_action',
          type: 'submit',
          timeToAction: 3000,
        },
        {
          name: 'scroll_action',
          type: 'scroll',
          timeToAction: 4000,
        },
      ];

      // Track all actions
      for (const action of actions) {
        await request(app).post('/action').send(action).expect(200);
      }

      // Filter by type: click
      const clickActionsResponse = await request(app)
        .get('/actions?type=click')
        .expect(200);

      expect(clickActionsResponse.body).toHaveLength(2);
      expect(
        clickActionsResponse.body.every(
          (action: any) => action.type === 'click'
        )
      ).toBe(true);

      // Filter by type: submit
      const submitActionsResponse = await request(app)
        .get('/actions?type=submit')
        .expect(200);

      expect(submitActionsResponse.body).toHaveLength(1);
      expect(submitActionsResponse.body[0].name).toBe('submit_action');

      // Filter by name
      const namedActionResponse = await request(app)
        .get('/actions?name=click_action_1')
        .expect(200);

      expect(namedActionResponse.body).toHaveLength(1);
      expect(namedActionResponse.body[0].name).toBe('click_action_1');

      // Filter by non-existent type
      const nonExistentResponse = await request(app)
        .get('/actions?type=nonexistent')
        .expect(200);

      expect(nonExistentResponse.body).toHaveLength(0);
    });

    it('should validate required parameters correctly', async () => {
      // Test missing name
      const invalidAction1 = {
        type: 'click',
        timeToAction: 5000,
      };

      const response1 = await request(app)
        .post('/action')
        .send(invalidAction1)
        .expect(400);

      expect(response1.body.error).toContain('Missing required parameters');

      // Test missing type
      const invalidAction2 = {
        name: 'test_action',
        timeToAction: 5000,
      };

      const response2 = await request(app)
        .post('/action')
        .send(invalidAction2)
        .expect(400);

      expect(response2.body.error).toContain('Missing required parameters');

      // Test missing timeToAction
      const invalidAction3 = {
        name: 'test_action',
        type: 'click',
      };

      const response3 = await request(app)
        .post('/action')
        .send(invalidAction3)
        .expect(400);

      expect(response3.body.error).toContain('Missing required parameters');

      // Test invalid timeToAction type
      const invalidAction4 = {
        name: 'test_action',
        type: 'click',
        timeToAction: 'invalid',
      };

      const response4 = await request(app)
        .post('/action')
        .send(invalidAction4)
        .expect(400);

      expect(response4.body.error).toContain('Missing required parameters');

      // Verify no actions were recorded due to validation failures
      const statsResponse = await request(app).get('/action/stats').expect(200);

      expect(statsResponse.body.total).toBe(0);
    });

    it('should handle complex metadata and optional parameters', async () => {
      // Action with complex metadata
      const complexAction = {
        name: 'complex_action',
        type: 'click',
        timeToAction: 7500,
        elementId: 'complex-btn',
        elementClass: 'btn btn-primary btn-lg',
        value: 'Complex Value with Spaces',
        userId: 'user-abc-123',
        sessionId: 'session-xyz-789',
        url: 'https://example.com/page?param=value',
        metadata: {
          campaign: 'holiday_sale_2025',
          source: 'email_newsletter',
          medium: 'cpc',
          content: 'hero_button',
          term: 'get_started',
          customData: {
            experiment: 'variant_b',
            cohort: 'premium_users',
            features: ['feature1', 'feature2'],
          },
          analytics: {
            eventId: 'evt_123456789',
            sessionStart: '2025-08-02T10:00:00.000Z',
            previousPage: '/landing',
            scrollDepth: 75,
          },
        },
      };

      // Track the complex action
      const response = await request(app)
        .post('/action')
        .send(complexAction)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Action tracked successfully',
      });

      // Retrieve and verify the action
      const actionsResponse = await request(app).get('/actions').expect(200);

      expect(actionsResponse.body).toHaveLength(1);
      const savedAction = actionsResponse.body[0];

      // Verify all fields are preserved
      expect(savedAction.name).toBe('complex_action');
      expect(savedAction.type).toBe('click');
      expect(savedAction.timeToAction).toBe(7500);
      expect(savedAction.elementId).toBe('complex-btn');
      expect(savedAction.elementClass).toBe('btn btn-primary btn-lg');
      expect(savedAction.value).toBe('Complex Value with Spaces');
      expect(savedAction.userId).toBe('user-abc-123');
      expect(savedAction.sessionId).toBe('session-xyz-789');
      expect(savedAction.url).toBe('https://example.com/page?param=value');
      expect(savedAction.metadata).toEqual(complexAction.metadata);
      expect(savedAction).toHaveProperty('timestamp');

      // Verify statistics include the complex action
      const statsResponse = await request(app).get('/action/stats').expect(200);

      expect(statsResponse.body.total).toBe(1);
      expect(statsResponse.body.byName.complex_action).toBe(1);
      expect(statsResponse.body.averageTimeToAction).toBe(7500);
    });

    it('should handle concurrent action tracking', async () => {
      // Simulate concurrent requests
      const actions = Array.from({ length: 10 }, (_, i) => ({
        name: `concurrent_action_${i}`,
        type: i % 2 === 0 ? 'click' : 'submit',
        timeToAction: (i + 1) * 1000,
        elementId: `element_${i}`,
      }));

      // Send all requests concurrently
      const promises = actions.map((action) =>
        request(app).post('/action').send(action).expect(200)
      );

      const responses = await Promise.all(promises);

      // Verify all responses are successful
      responses.forEach((response) => {
        expect(response.body).toEqual({
          success: true,
          message: 'Action tracked successfully',
        });
      });

      // Verify all actions were recorded
      const statsResponse = await request(app).get('/action/stats').expect(200);

      expect(statsResponse.body.total).toBe(10);
      expect(statsResponse.body.byType.click).toBe(5);
      expect(statsResponse.body.byType.submit).toBe(5);

      // Verify expected average
      const expectedAverage =
        (1000 + 2000 + 3000 + 4000 + 5000 + 6000 + 7000 + 8000 + 9000 + 10000) /
        10;
      expect(statsResponse.body.averageTimeToAction).toBe(expectedAverage);
    });
  });
});
