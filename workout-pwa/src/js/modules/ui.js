/**
 * UI module for workout tracker
 * Handles rendering and UI interactions
 */

/**
 * Initialize the UI
 */
export function initUI() {
  // Set up event listeners
  setupEventListeners();
  
  // Check for previously loaded workout
  checkForPreviousWorkout();
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  // File upload handling
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileInputChange);
    
    // Drag and drop handling
    const uploadContainer = document.querySelector('.upload-container');
    if (uploadContainer) {
      uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
      });
      
      uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('dragover');
      });
      
      uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          handleFileInputChange({ target: fileInput });
        }
      });
    }
  }
}

/**
 * Handle file input change event
 * @param {Event} e - Change event
 */
function handleFileInputChange(e) {
  // This function will be implemented in app.js
  // We're just defining the structure here
  if (typeof window.handleFileUpload === 'function') {
    window.handleFileUpload(e);
  } else {
    console.error('File upload handler not implemented');
  }
}

/**
 * Check for previously loaded workout
 */
function checkForPreviousWorkout() {
  // This function will be implemented in app.js
  // We're just defining the structure here
  if (typeof window.loadPreviousWorkout === 'function') {
    window.loadPreviousWorkout();
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
  // Create error element if it doesn't exist
  let errorElement = document.getElementById('error-message');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'error-message';
    
    // Insert after header
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(errorElement, header.nextSibling);
    } else {
      document.body.insertBefore(errorElement, document.body.firstChild);
    }
  }
  
  // Set message and show
  errorElement.textContent = message;
  errorElement.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.remove('show');
  }, 5000);
}

/**
 * Show loading state
 * @param {boolean} isLoading - Whether loading is active
 */
export function showLoading(isLoading) {
  const uploadSection = document.getElementById('upload-section');
  
  if (uploadSection) {
    if (isLoading) {
      uploadSection.classList.add('loading');
    } else {
      uploadSection.classList.remove('loading');
    }
  }
}

/**
 * Generate a preview of sheet data
 * @param {Array} data - Sheet data (first few rows)
 * @returns {HTMLElement} - Preview element
 */
function generateSheetPreview(data) {
  // Create preview container
  const previewContainer = document.createElement('div');
  previewContainer.className = 'sheet-preview';
  
  // Create preview table
  const table = document.createElement('table');
  table.className = 'preview-table';
  
  // Limit to first 5 rows and 5 columns for preview
  const previewRows = data.slice(0, 5);
  
  // Create table rows
  previewRows.forEach(row => {
    const tr = document.createElement('tr');
    
    // Limit to first 5 columns
    const previewCols = row.slice(0, 5);
    
    previewCols.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell || '';
      tr.appendChild(td);
    });
    
    table.appendChild(tr);
  });
  
  previewContainer.appendChild(table);
  return previewContainer;
}

/**
 * Show sheet selector UI with previews
 * @param {Object} sheetsData - Object with sheet names as keys and preview data as values
 */
export function showSheetSelectorWithPreviews(sheetsData) {
  // Remove any existing sheet selector
  const existingSelector = document.getElementById('sheet-selection-modal');
  if (existingSelector) {
    existingSelector.remove();
  }

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'sheet-selection-modal';
  modalContainer.className = 'modal';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create title
  const title = document.createElement('h3');
  title.textContent = 'Select a Sheet';
  modalContent.appendChild(title);

  // Create sheet options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'sheet-options';

  // Create sheet options with previews
  Object.entries(sheetsData).forEach(([sheetName, previewData]) => {
    const optionContainer = document.createElement('div');
    optionContainer.className = 'sheet-option';
    
    // Sheet name
    const nameElement = document.createElement('h4');
    nameElement.textContent = sheetName;
    optionContainer.appendChild(nameElement);
    
    // Sheet preview
    const previewElement = generateSheetPreview(previewData);
    optionContainer.appendChild(previewElement);
    
    // Select button
    const selectButton = document.createElement('button');
    selectButton.textContent = 'Select This Sheet';
    selectButton.className = 'select-sheet-button';
    selectButton.addEventListener('click', () => {
      // Call the sheet selection handler from app.js
      if (typeof window.handleSheetSelection === 'function') {
        window.handleSheetSelection(sheetName);
      }
      
      // Remove the modal
      modalContainer.remove();
    });
    optionContainer.appendChild(selectButton);
    
    optionsContainer.appendChild(optionContainer);
  });
  
  modalContent.appendChild(optionsContainer);

  // Add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = 'cancel-button';
  cancelButton.addEventListener('click', () => {
    modalContainer.remove();
  });
  modalContent.appendChild(cancelButton);

  // Add modal content to container
  modalContainer.appendChild(modalContent);

  // Add to body
  document.body.appendChild(modalContainer);
}

/**
 * Show sheet selector UI (legacy version without previews)
 * @param {string[]} sheets - List of sheet names
 */
export function showSheetSelector(sheets) {
  // For backward compatibility, convert to format for preview version
  const sheetsData = {};
  sheets.forEach(sheet => {
    // Empty preview data for legacy version
    sheetsData[sheet] = [['No preview available']];
  });
  
  showSheetSelectorWithPreviews(sheetsData);
}

/**
 * Render workout data to the UI
 * @param {Object} workoutData - Processed workout data
 */
export function renderWorkout(workoutData) {
  // Set program info
  document.getElementById('program-title').textContent = workoutData.title || 'My Workout';
  document.getElementById('program-phase').textContent = workoutData.phase || '';
  
  // Clear existing workouts
  const workoutsContainer = document.getElementById('workouts-container');
  workoutsContainer.innerHTML = '';
  
  // Render each workout day
  workoutData.days.forEach(day => {
    const dayElement = createWorkoutDayElement(day);
    workoutsContainer.appendChild(dayElement);
  });
  
  // Show workout section, hide upload section
  document.getElementById('upload-section').classList.add('hidden');
  document.getElementById('workout-section').classList.remove('hidden');
}

/**
 * Create workout day element
 * @param {Object} day - Workout day data
 * @returns {HTMLElement} - Day element
 */
function createWorkoutDayElement(day) {
  const section = document.createElement('section');
  section.className = 'workout-day';
  
  // Create day title
  const title = document.createElement('h3');
  title.className = 'day-title';
  title.textContent = day.name;
  section.appendChild(title);
  
  // Create exercises container
  const exercisesContainer = document.createElement('div');
  exercisesContainer.className = 'exercises';
  section.appendChild(exercisesContainer);
  
  // Add exercises
  day.exercises.forEach(exercise => {
    const exerciseElement = createExerciseElement(exercise);
    exercisesContainer.appendChild(exerciseElement);
  });
  
  // Make day title collapsible
  title.addEventListener('click', () => {
    section.classList.toggle('collapsed');
  });
  
  return section;
}

/**
 * Create exercise element
 * @param {Object} exercise - Exercise data
 * @returns {HTMLElement} - Exercise element
 */
function createExerciseElement(exercise) {
  const element = document.createElement('div');
  element.className = 'exercise-item';
  element.dataset.exerciseName = exercise.name;
  
  // Exercise name
  const nameElement = document.createElement('div');
  nameElement.className = 'exercise-name';
  nameElement.textContent = exercise.name;
  element.appendChild(nameElement);
  
  // Exercise details
  const detailsElement = document.createElement('div');
  detailsElement.className = 'exercise-details';
  
  // Add details if they exist
  if (exercise.workingSets) {
    addDetailItem(detailsElement, 'Sets', exercise.setsFormatted || `${exercise.workingSets} sets`);
  }
  
  if (exercise.reps) {
    addDetailItem(detailsElement, 'Reps', exercise.repsFormatted || exercise.reps);
  }
  
  if (exercise.load) {
    addDetailItem(detailsElement, 'Load', exercise.loadFormatted || exercise.load);
  }
  
  if (exercise.rest) {
    addDetailItem(detailsElement, 'Rest', exercise.restFormatted || exercise.rest);
  }
  
  if (exercise.rpe) {
    addDetailItem(detailsElement, 'RPE', exercise.rpe);
  }
  
  element.appendChild(detailsElement);
  
  // Add notes if they exist
  if (exercise.notes) {
    const notesElement = document.createElement('div');
    notesElement.className = 'exercise-notes';
    notesElement.textContent = exercise.notes;
    element.appendChild(notesElement);
  }
  
  // Add progress tracking
  const progressElement = document.createElement('div');
  progressElement.className = 'exercise-progress';
  
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.placeholder = 'Weight';
  weightInput.className = 'weight-input';
  
  const repsInput = document.createElement('input');
  repsInput.type = 'number';
  repsInput.placeholder = 'Reps';
  repsInput.className = 'reps-input';
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.className = 'save-button';
  saveButton.addEventListener('click', () => {
    const weight = weightInput.value;
    const reps = repsInput.value;
    
    if (weight && reps) {
      // This function will be implemented in app.js
      if (typeof window.saveExerciseProgress === 'function') {
        window.saveExerciseProgress(exercise.name, weight, reps);
        
        // Clear inputs after saving
        weightInput.value = '';
        repsInput.value = '';
      }
    }
  });
  
  progressElement.appendChild(weightInput);
  progressElement.appendChild(repsInput);
  progressElement.appendChild(saveButton);
  
  element.appendChild(progressElement);
  
  return element;
}

/**
 * Add detail item to details element
 * @param {HTMLElement} detailsElement - Details container
 * @param {string} label - Detail label
 * @param {string} value - Detail value
 */
function addDetailItem(detailsElement, label, value) {
  const item = document.createElement('div');
  item.className = 'detail-item';
  
  const labelElement = document.createElement('span');
  labelElement.className = 'detail-label';
  labelElement.textContent = `${label}: `;
  
  const valueElement = document.createElement('span');
  valueElement.className = 'detail-value';
  valueElement.textContent = value;
  
  item.appendChild(labelElement);
  item.appendChild(valueElement);
  
  detailsElement.appendChild(item);
}