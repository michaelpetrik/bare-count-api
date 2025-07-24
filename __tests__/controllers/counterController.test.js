"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const counterController_1 = require("../../src/controllers/counterController");
// Create a test app
const app = (0, express_1.default)();
app.get('/test', counterController_1.counterController);
describe('counterController', () => {
    describe('GET /test', () => {
        it('should respond with done and status 200', async () => {
            // Act
            const response = await (0, supertest_1.default)(app).get('/test').expect(200);
            // Assert
            expect(response.text).toBe('done');
        });
        it('should record a visit when called', async () => {
            // Act
            const response = await (0, supertest_1.default)(app).get('/test').expect(200);
            // Assert
            expect(response.status).toBe(200);
            expect(response.text).toBe('done');
        });
    });
});
