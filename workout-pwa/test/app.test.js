// Import app module functions
import * as AppModule from '../src/js/app.js';
import * as FileProcessor from '../src/js/modules/file-processor.js';
import * as DB from '../src/js/modules/db.js';
import * as UI from '../src/js/modules/ui.js';

// Mock the modules
jest.mock('../src/js/modules/file-processor.js');
jest.mock('../src/js/modules/db.js');
jest.mock('../src/js/modules/ui.js');

describe('App Module', () => {
  let mockFile;
  let mockEvent;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock file
    mockFile = new File(['test data'], 'test-workout.csv', { type: 'text/csv' });
    mockEvent = { 
      target: { 
        files: [mockFile] 
      } 
    };

    // Mock global window methods
    window.currentWorkout = null;

    // Setup mocks
    FileProcessor.processFile.mockResolvedValue({
      title: 'Test Workout',
      phase: 'Test Phase',
      days: []
    });
    FileProcessor.formatWorkoutData.mockReturnValue({
      title: 'Test Workout',
      phase: 'Test Phase',
      days: []
    });

    DB.saveWorkout.mockResolvedValue(1);
    DB.saveExercises.mockResolvedValue([1, 2]);
    DB.getMostRecentWorkout.mockResolvedValue({
      id: 1,
      data: {
        title: 'Previous Workout',
        days: []
      }
    });
    DB.getExercisesByWorkout.mockResolvedValue([
      { id: 1, name: 'Test Exercise' }
    ]);
    DB.saveProgress.mockResolvedValue(true);

    UI.renderWorkout.mockImplementation(() => {});
    UI.showLoading.mockImplementation(() => {});
    UI.showError.mockImplementation(() => {});
  });

  test('handleFileUpload processes file successfully', async () => {
    await AppModule.handleFileUpload(mockEvent);

    expect(FileProcessor.processFile).toHaveBeenCalledWith(mockFile);
    expect(UI.showLoading).toHaveBeenCalledWith(true);
    expect(DB.saveWorkout).toHaveBeenCalled();
    expect(UI.renderWorkout).toHaveBeenCalled();
    expect(UI.showLoading).toHaveBeenCalledWith(false);
  });

  test('handleFileUpload handles file processing error', async () => {
    FileProcessor.processFile.mockRejectedValue(new Error('Invalid file'));

    await AppModule.handleFileUpload(mockEvent);

    expect(UI.showLoading).toHaveBeenCalledWith(true);
    expect(UI.showError).toHaveBeenCalledWith('Invalid file');
    expect(UI.showLoading).toHaveBeenCalledWith(false);
  });

  test('loadPreviousWorkout retrieves most recent workout', async () => {
    const result = await AppModule.loadPreviousWorkout();

    expect(DB.getMostRecentWorkout).toHaveBeenCalled();
    expect(UI.renderWorkout).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('loadPreviousWorkout handles no previous workout', async () => {
    DB.getMostRecentWorkout.mockResolvedValue(null);

    const result = await AppModule.loadPreviousWorkout();

    expect(DB.getMostRecentWorkout).toHaveBeenCalled();
    expect(UI.renderWorkout).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  test('saveExerciseProgress saves exercise progress', async () => {
    window.currentWorkout = {
      id: 1,
      data: {
        title: 'Test Workout',
        days: []
      }
    };

    await AppModule.saveExerciseProgress('Test Exercise', 185, 10);

    expect(DB.getExercisesByWorkout).toHaveBeenCalledWith(1);
    expect(DB.saveProgress).toHaveBeenCalledWith(1, 185, 10);
  });

  test('saveExerciseProgress handles errors', async () => {
    window.currentWorkout = null;

    await AppModule.saveExerciseProgress('Test Exercise', 185, 10);

    expect(UI.showError).toHaveBeenCalledWith('No workout loaded');
  });

  test('init initializes the app', () => {
    // Mock document methods
    const addEventListenerMock = jest.fn();
    const getElementByIdMock = jest.fn().mockReturnValue({
      addEventListener: jest.fn()
    });
    
    // Save original methods
    const originalAddEventListener = document.addEventListener;
    const originalGetElementById = document.getElementById;
    
    // Replace with mocks
    document.addEventListener = addEventListenerMock;
    document.getElementById = getElementByIdMock;
    
    try {
      // Call init directly instead of checking if it's called by DOMContentLoaded
      AppModule.init();
      
      // Verify getElementById was called
      expect(getElementByIdMock).toHaveBeenCalledWith('fileInput');
    } finally {
      // Restore original methods
      document.addEventListener = originalAddEventListener;
      document.getElementById = originalGetElementById;
    }
  });
});