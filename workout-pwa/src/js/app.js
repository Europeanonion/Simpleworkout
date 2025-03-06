import * as FileProcessor from './modules/file-processor.js';
import * as DB from './modules/db.js';
import * as UI from './modules/ui.js';

// Global state
window.currentWorkout = null;

// Store the uploaded file for sheet selection
let currentUploadedFile = null;

/**
 * Handle file upload event
 * @param {Event} event - File upload event
 */
export async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Store the file for later use if sheet selection is needed
  currentUploadedFile = file;

  try {
    UI.showLoading(true);
    
    // Process the uploaded file
    const result = await FileProcessor.processFile(file);
    
    // Check if we need to handle multiple sheets
    if (result.type === 'multiple_sheets') {
      // Show sheet selection UI with previews
      UI.showSheetSelectorWithPreviews(result.sheetsData);
      return;
    }
    
    // Process workout data
    await processWorkoutData(result.data);
    
  } catch (error) {
    UI.showError(error.message || 'Failed to process workout file');
  } finally {
    UI.showLoading(false);
  }
}

/**
 * Handle sheet selection
 * @param {string} sheetName - Selected sheet name
 */
export async function handleSheetSelection(sheetName) {
  if (!currentUploadedFile) {
    UI.showError('No file uploaded');
    return;
  }
  
  try {
    UI.showLoading(true);
    
    // Process the file with the selected sheet
    const result = await FileProcessor.processFile(currentUploadedFile, sheetName);
    
    // Process workout data
    await processWorkoutData(result.data);
    
  } catch (error) {
    UI.showError(error.message || 'Failed to process selected sheet');
  } finally {
    UI.showLoading(false);
  }
}

/**
 * Process workout data and save to database
 * @param {Object} rawWorkoutData - Raw workout data
 */
async function processWorkoutData(rawWorkoutData) {
  // Format the workout data
  const workoutData = FileProcessor.formatWorkoutData(rawWorkoutData);
  
  // Save workout to database
  const workoutId = await DB.saveWorkout({
    name: workoutData.title,
    phase: workoutData.phase,
    data: workoutData
  });
  
  // Save exercises
  const exercisePromises = workoutData.days.flatMap(day =>
    day.exercises.map(exercise =>
      DB.saveExercises(workoutId, [{
        name: exercise.name,
        day: day.name,
        data: exercise
      }])
    )
  );
  
  await Promise.all(exercisePromises);
  
  // Render workout and update global state
  UI.renderWorkout(workoutData);
  window.currentWorkout = { id: workoutId, data: workoutData };
}

/**
 * Load the most recent workout
 * @returns {Promise<boolean>} - Whether a workout was loaded
 */
export async function loadPreviousWorkout() {
  try {
    const mostRecentWorkout = await DB.getMostRecentWorkout();
    
    if (mostRecentWorkout) {
      UI.renderWorkout(mostRecentWorkout.data);
      window.currentWorkout = mostRecentWorkout;
      return true;
    }
    
    return false;
  } catch (error) {
    UI.showError('Failed to load previous workout');
    return false;
  }
}

/**
 * Save exercise progress
 * @param {string} exerciseName - Name of the exercise
 * @param {number} weight - Weight used
 * @param {number} reps - Number of reps
 */
export async function saveExerciseProgress(exerciseName, weight, reps) {
  if (!window.currentWorkout) {
    UI.showError('No workout loaded');
    return;
  }

  try {
    const exercises = await DB.getExercisesByWorkout(window.currentWorkout.id);
    const matchingExercise = exercises.find(ex => ex.name === exerciseName);

    if (matchingExercise) {
      await DB.saveProgress(matchingExercise.id, weight, reps);
    } else {
      UI.showError(`Exercise ${exerciseName} not found in current workout`);
    }
  } catch (error) {
    UI.showError('Failed to save exercise progress');
  }
}

// Initialize app
export function init() {
  // Add event listeners
  document.getElementById('fileInput').addEventListener('change', handleFileUpload);
  
  // Try to load previous workout on startup
  loadPreviousWorkout();
}

// Expose functions to global scope for event handling
window.handleFileUpload = handleFileUpload;
window.handleSheetSelection = handleSheetSelection;
window.loadPreviousWorkout = loadPreviousWorkout;
window.saveExerciseProgress = saveExerciseProgress;
window.init = init;

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);