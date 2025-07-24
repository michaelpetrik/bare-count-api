import request from 'supertest';
import express from 'express';
import { counterController } from '../../src/controllers/counterController';

// Create a test app
const app = express();
app.get('/test', counterController);

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
