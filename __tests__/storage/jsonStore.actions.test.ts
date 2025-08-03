import fs from 'fs';
import path from 'path';
import { JsonStore } from '../../src/storage/jsonStore';
import { Action } from '../../src/types/action';
import { Visit } from '../../src/types/visit';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('JsonStore - Action Methods', () => {
  let jsonStore: JsonStore;
  let testFilePath: string;

  beforeEach(() => {
    testFilePath = '/test/storage.json';
    jsonStore = new JsonStore(testFilePath);
    jest.clearAllMocks();
  });

  describe('recordAction', () => {
    it('should record action in new storage format', () => {
      // Arrange
      const existingData = {
        visits: [],
        actions: [],
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(existingData));

      const action: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'newsletter_signup',
        type: 'click',
        timeToAction: 5000,
        timestamp: '2025-08-02T10:00:00.000Z',
      };

      const expectedData = {
        visits: [],
        actions: [action],
      };

      // Act
      jsonStore.recordAction(action);

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        JSON.stringify(expectedData, null, 2)
      );
    });

    it('should append action to existing actions', () => {
      // Arrange
      const existingAction: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'existing_action',
        type: 'click',
        timeToAction: 3000,
        timestamp: '2025-08-01T10:00:00.000Z',
      };

      const existingData = {
        visits: [],
        actions: [existingAction],
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(existingData));

      const newAction: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'new_action',
        type: 'submit',
        timeToAction: 7000,
        timestamp: '2025-08-02T10:00:00.000Z',
      };

      const expectedData = {
        visits: [],
        actions: [existingAction, newAction],
      };

      // Act
      jsonStore.recordAction(newAction);

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        JSON.stringify(expectedData, null, 2)
      );
    });

    it('should handle backward compatibility - convert array to new format', () => {
      // Arrange - old format with just visits array
      const oldVisits: Visit[] = [
        {
          sessionId: '123',
          timestamp: '2025-08-01T10:00:00.000Z',
          country: 'CZ',
          browser: 'Chrome',
        },
      ];
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(oldVisits));

      const action: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'test_action',
        type: 'click',
        timeToAction: 5000,
        timestamp: '2025-08-02T10:00:00.000Z',
      };

      const expectedData = {
        visits: oldVisits,
        actions: [action],
      };

      // Act
      jsonStore.recordAction(action);

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        JSON.stringify(expectedData, null, 2)
      );
    });

    it('should create file if it does not exist', () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(false);
      const initialData = { visits: [], actions: [] };

      // Mock readFileSync to return the initial data after file creation
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(initialData));

      const action: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'first_action',
        type: 'click',
        timeToAction: 2000,
        timestamp: '2025-08-02T10:00:00.000Z',
      };

      const expectedData = {
        visits: [],
        actions: [action],
      };

      // Act
      jsonStore.recordAction(action);

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(
        1,
        testFilePath,
        JSON.stringify(initialData, null, 2)
      );
      expect(mockedFs.writeFileSync).toHaveBeenNthCalledWith(
        2,
        testFilePath,
        JSON.stringify(expectedData, null, 2)
      );
    });
  });

  describe('getAllActions', () => {
    it('should return actions from new storage format', () => {
      // Arrange
      const actions: Action[] = [
        {
          sessionId: '123',
          elementId: 'signup-btn',
          elementClass: 'btn',
          scrollPosition: 100,
          name: 'action1',
          type: 'click',
          timeToAction: 1000,
          timestamp: '2025-08-01T10:00:00.000Z',
        },
        {
          sessionId: '123',
          elementId: 'signup-btn',
          elementClass: 'btn',
          scrollPosition: 100,
          name: 'action2',
          type: 'submit',
          timeToAction: 5000,
          timestamp: '2025-08-02T10:00:00.000Z',
        },
      ];

      const storageData = {
        visits: [],
        actions,
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(storageData));

      // Act
      const result = jsonStore.getAllActions();

      // Assert
      expect(result).toEqual(actions);
    });

    it('should return empty array for new storage format with no actions', () => {
      // Arrange
      const storageData = {
        visits: [],
        actions: [],
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(storageData));

      // Act
      const result = jsonStore.getAllActions();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle backward compatibility - return empty actions for old format', () => {
      // Arrange - old format with just visits array
      const oldVisits: Visit[] = [
        {
          sessionId: '123',
          timestamp: '2025-08-01T10:00:00.000Z',
          country: 'CZ',
        },
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(oldVisits));

      // Act
      const result = jsonStore.getAllActions();

      // Assert
      expect(result).toEqual([]);
    });

    it('should create file and return empty array if file does not exist', () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(false);
      const initialData = { visits: [], actions: [] };

      // Mock readFileSync to return the initial data after file creation
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(initialData));

      // Act
      const result = jsonStore.getAllActions();

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        JSON.stringify(initialData, null, 2)
      );
      expect(result).toEqual([]);
    });
  });

  describe('Integration with visits', () => {
    it('should maintain visits when working with actions', () => {
      // Arrange
      const existingVisits: Visit[] = [
        {
          sessionId: '123',
          timestamp: '2025-08-01T10:00:00.000Z',
          country: 'CZ',
          browser: 'Chrome',
        },
      ];

      const existingActions: Action[] = [
        {
          sessionId: '123',
          elementId: 'signup-btn',
          elementClass: 'btn',
          scrollPosition: 100,
          name: 'existing_action',
          type: 'click',
          timeToAction: 3000,
          timestamp: '2025-08-01T11:00:00.000Z',
        },
      ];

      const existingData = {
        visits: existingVisits,
        actions: existingActions,
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(existingData));

      const newAction: Action = {
        sessionId: '123',
        elementId: 'signup-btn',
        elementClass: 'btn',
        scrollPosition: 100,
        name: 'new_action',
        type: 'submit',
        timeToAction: 8000,
        timestamp: '2025-08-02T10:00:00.000Z',
      };

      const expectedData = {
        visits: existingVisits,
        actions: [...existingActions, newAction],
      };

      // Act
      jsonStore.recordAction(newAction);

      // Assert
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        JSON.stringify(expectedData, null, 2)
      );

      // Test that visits are still accessible
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(expectedData));
      const visits = jsonStore.getAllVisits();
      expect(visits).toEqual(existingVisits);
    });
  });
});
