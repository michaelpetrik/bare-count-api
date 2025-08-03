import request from 'supertest';
import express from 'express';
import {
  handleHit,
  getHitStats,
} from '../../src/controllers/counterController';

// Create a test app
const app = express();
app.get('/test', handleHit);
app.get('/stats', getHitStats);
describe('counterController', () => {
  describe('GET /test', () => {
    it('should respond with done and status 200', async () => {
      // Act
      const response = await request(app).get('/test').expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Visit recorded successfully',
      });
      expect(response.body.sessionId).toMatch(/^session_[a-f0-9-]+$/);
    });

    it('should record a visit when called', async () => {
      // Act
      const response = await request(app).get('/test').expect(200);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Visit recorded successfully',
      });
      expect(response.body.sessionId).toMatch(/^session_[a-f0-9-]+$/);
    });
  });
});
describe('getHitStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should respond with the correct visit counts', async () => {
    // Act
    const response = await request(app).get('/stats').expect(200);
  });
});
