import * as FileProcessor from './modules/file-processor.js';
import * as DB from './modules/db.js';
import * as UI from './modules/ui.js';
import * as Navigation from './modules/navigation.js';
import * as ProgramManager from './modules/program-manager.js';
import * as Visualization from './modules/visualization.js';

// Global state
window.currentWorkout = null;
window.selectedWorkoutDate = null;

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
      // Use the selected date or default to today
      const date = window.selectedWorkoutDate || new Date();
      
      // Save progress with the selected date
      await DB.saveProgress(matchingExercise.id, weight, reps, '', date);
      
      // Show success toast
      UI.showToast(`Progress saved for ${exerciseName}`);
      
      // Update UI to show latest progress
      updateExerciseProgressUI(exerciseName, weight, reps);
    } else {
      UI.showError(`Exercise ${exerciseName} not found in current workout`);
    }
  } catch (error) {
    UI.showError('Failed to save exercise progress');
  }
}

/**
 * Update exercise UI with latest progress
 * @param {string} exerciseName - Name of the exercise
 * @param {number} weight - Weight used
 * @param {number} reps - Number of reps
 */
function updateExerciseProgressUI(exerciseName, weight, reps) {
  // Find the exercise element
  const exerciseElements = document.querySelectorAll('.exercise-item');
  for (const element of exerciseElements) {
    const titleElement = element.querySelector('.exercise-title');
    if (titleElement && titleElement.textContent.includes(exerciseName)) {
      // Update latest weight/reps display
      const progressElement = element.querySelector('.exercise-progress-history');
      if (progressElement) {
        const latestEntry = document.createElement('div');
        latestEntry.className = 'history-item';
        latestEntry.innerHTML = `
          <div class="history-performance">
            ${weight} kg × ${reps} <span class="trend-up"><i class="fas fa-arrow-up"></i></span>
          </div>
        `;
        
        // Add to beginning of history
        if (progressElement.firstChild) {
          progressElement.insertBefore(latestEntry, progressElement.firstChild);
        } else {
          progressElement.appendChild(latestEntry);
        }
      }
      
      break;
    }
  }
}

/**
 * Select a workout date
 * @param {Date} date - Selected date
 */
export async function selectWorkoutDate(date) {
  // Store the selected date
  window.selectedWorkoutDate = date;
  
  // Update UI to show selected date
  UI.updateDateSelector(date);
  
  // Load workout data for the selected date
  await loadWorkoutForDate(date);
}

/**
 * Load workout data for selected date
 * @param {Date} date - Selected date
 */
async function loadWorkoutForDate(date) {
  try {
    // Query database for workouts on this date
    const workout = await DB.getWorkoutForDate(date);
    
    if (workout) {
      UI.renderWorkout(workout.data);
      window.currentWorkout = workout;
      
      // Hide empty state
      const emptyState = document.getElementById('empty-workout-state');
      if (emptyState) emptyState.classList.add('hidden');
    } else {
      // No workout for this date
      const emptyState = document.getElementById('empty-workout-state');
      if (emptyState) emptyState.classList.remove('hidden');
      
      // Clear workouts container
      const workoutsContainer = document.getElementById('workouts-container');
      if (workoutsContainer) workoutsContainer.innerHTML = '';
    }
  } catch (error) {
    console.error('Error loading workout for date:', error);
    UI.showError('Failed to load workout for selected date');
  }
}

// Initialize application
async function init() {
  try {
    // Initialize database
    await DB.init();
    
    // Initialize navigation
    Navigation.init();
    
    // Initialize program manager
    const hasProgramData = await ProgramManager.init();
    
    if (!hasProgramData) {
      // Create default programs for new users
      await ProgramManager.createDefaultPrograms();
    }
    
    // Initialize UI with current program
    const currentProgram = ProgramManager.getCurrentProgram();
    UI.initializeWithProgram(currentProgram);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize with today's date
    const today = new Date();
    selectWorkoutDate(today);
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show error message to user
    UI.showError('Failed to initialize application. Please reload the page.');
  }
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  // File input handler
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Program selection handlers
  document.addEventListener('click', function(event) {
    // Delegate click events for program cards
    if (event.target.closest('.program-card')) {
      const card = event.target.closest('.program-card');
      const programId = card.getAttribute('data-program-id');
      if (programId) {
        selectProgram(parseInt(programId, 10));
      }
    }
    
    // Phase toggle handler
    if (event.target.closest('.phase-header')) {
      const header = event.target.closest('.phase-header');
      togglePhase(header);
    }
  });
  
  // Page change event
  document.addEventListener('pageChanged', function(event) {
    const { current, previous } = event.detail;
    console.log(`Navigated from ${previous} to ${current}`);
    
    // Update UI based on page change
    if (current === 'progressPage') {
      loadProgressData();
    } else if (current === 'historyPage') {
      loadHistoryData();
    }
  });
}

// Existing helper functions remain the same...

// Expose functions to global scope
window.handleFileUpload = handleFileUpload;
window.handleSheetSelection = handleSheetSelection;
window.loadPreviousWorkout = loadPreviousWorkout;
window.saveExerciseProgress = saveExerciseProgress;
window.selectWorkoutDate = selectWorkoutDate;
window.init = init;

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

export { init };