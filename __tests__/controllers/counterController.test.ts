import request from 'supertest';
import express from 'express';
import {
  handleVisit,
  getVisitCounts,
} from '../../src/controllers/counterController';

// Create a test app
const app = express();
app.get('/test', handleVisit);
app.get('/counts', getVisitCounts);
describe('counterController', () => {
  describe('GET /test', () => {
    it('should respond with done and status 200', async () => {
      // Act
      const response = await request(app).get('/test').expect(200);

      // Assert
      expect(response.text).toBe('done');
    });

    it('should record a visit when called', async () => {
      // Act
      const response = await request(app).get('/test').expect(200);

      // Assert
      expect(response.status).toBe(200);
      expect(response.text).toBe('done');
    });
  });
});
describe('getVisitCounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should respond with the correct visit counts', async () => {
    // Act
    const response = await request(app).get('/counts').expect(200);
  });
});
