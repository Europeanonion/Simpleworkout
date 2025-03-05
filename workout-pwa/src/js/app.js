/**
 * Main application file for workout tracker PWA
 */

import { processFile, formatWorkoutData } from './modules/file-processor.js';
import { 
  saveWorkout, 
  saveExercises, 
  getMostRecentWorkout, 
  getExercisesByWorkout,
  saveProgress,
  getProgressHistory
} from './modules/db.js';
import { initUI, showError, showLoading, renderWorkout } from './modules/ui.js';

// Current workout data
let currentWorkout = null;

/**
 * Initialize the application
 */
async function init() {
  console.log('Initializing workout tracker app');
  
  // Initialize UI
  initUI();
  
  // Set up global handlers for UI module
  window.handleFileUpload = handleFileUpload;
  window.loadPreviousWorkout = loadPreviousWorkout;
  window.saveExerciseProgress = saveExerciseProgress;
  
  // Load previous workout if available
  await loadPreviousWorkout();
}

/**
 * Handle file upload
 * @param {Event} e - File input change event
 */
async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Show loading state
  showLoading(true);
  
  try {
    // Process the file
    const workoutData = await processFile(file);
    
    // Format the data for display
    const formattedData = formatWorkoutData(workoutData);
    
    // Save to database
    const workoutId = await saveWorkout({
      name: formattedData.title,
      phase: formattedData.phase,
      data: formattedData
    });
    
    // Save exercises
    const exercises = [];
    formattedData.days.forEach(day => {
      day.exercises.forEach(exercise => {
        exercises.push({
          name: exercise.name,
          day: day.name,
          data: exercise
        });
      });
    });
    
    await saveExercises(workoutId, exercises);
    
    // Set as current workout
    currentWorkout = {
      id: workoutId,
      data: formattedData
    };
    
    // Render the workout
    renderWorkout(formattedData);
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    showError(error.message || 'Failed to process workout file');
  } finally {
    // Hide loading state
    showLoading(false);
  }
}

/**
 * Load the most recent workout from database
 */
async function loadPreviousWorkout() {
  try {
    const workout = await getMostRecentWorkout();
    
    if (workout) {
      // Set as current workout
      currentWorkout = {
        id: workout.id,
        data: workout.data
      };
      
      // Render the workout
      renderWorkout(workout.data);
      
      return true;
    }
  } catch (error) {
    console.error('Error loading previous workout:', error);
  }
  
  return false;
}

/**
 * Save exercise progress
 * @param {string} exerciseName - Name of the exercise
 * @param {number} weight - Weight used
 * @param {number} reps - Reps completed
 */
async function saveExerciseProgress(exerciseName, weight, reps) {
  if (!currentWorkout) {
    showError('No workout loaded');
    return;
  }
  
  try {
    // Find the exercise in the current workout
    const exercises = await getExercisesByWorkout(currentWorkout.id);
    const exercise = exercises.find(ex => ex.name === exerciseName);
    
    if (!exercise) {
      showError(`Exercise "${exerciseName}" not found`);
      return;
    }
    
    // Save progress
    await saveProgress(exercise.id, weight, reps);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = `Progress saved for ${exerciseName}`;
    
    // Find the exercise element
    const exerciseElement = document.querySelector(`.exercise-item[data-exercise-name="${exerciseName}"]`);
    if (exerciseElement) {
      // Add success message
      exerciseElement.appendChild(successMessage);
      
      // Remove after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error saving exercise progress:', error);
    showError('Failed to save progress');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}