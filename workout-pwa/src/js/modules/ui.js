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
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} [type='success'] - Type of toast (success, error, warning)
 */
export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/**
 * Update date selector UI
 * @param {Date} selectedDate - Currently selected date
 */
export function updateDateSelector(selectedDate) {
  const datePicker = document.querySelector('.date-picker');
  if (!datePicker) return;
  
  // Clear existing date items
  datePicker.innerHTML = '';
  
  // Generate date range (3 days before and 3 days after)
  const dates = generateDateRange(selectedDate);
  
  // Add date items for each day
  dates.forEach(date => {
    const dateItem = document.createElement('div');
    dateItem.className = 'date-item';
    
    // Check if this date is the selected date
    if (isSameDay(date, selectedDate)) {
      dateItem.classList.add('active');
    }
    
    const weekday = document.createElement('div');
    weekday.className = 'date-weekday';
    weekday.textContent = formatWeekday(date);
    
    const day = document.createElement('div');
    day.className = 'date-day';
    day.textContent = date.getDate();
    
    dateItem.appendChild(weekday);
    dateItem.appendChild(day);
    
    // Add click handler
    dateItem.addEventListener('click', () => {
      if (typeof window.selectWorkoutDate === 'function') {
        window.selectWorkoutDate(date);
      }
    });
    
    datePicker.appendChild(dateItem);
  });
}

/**
 * Generate a range of dates for the week
 * @param {Date} centerDate - Date to center the range on
 * @returns {Date[]} Array of dates
 */
function generateDateRange(centerDate) {
  const dates = [];
  const startDate = new Date(centerDate);
  startDate.setDate(startDate.getDate() - 3); // 3 days before
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format weekday (Mon, Tue, etc)
 * @param {Date} date - Date to format
 * @returns {string} Formatted weekday
 */
function formatWeekday(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

// Existing methods from the original ui.js remain the same...

/**
 * Render workout data to the UI
 * @param {Object} workoutData - Processed workout data
 */
export function renderWorkout(workoutData) {
  // Set program info
  const programTitleElement = document.getElementById('programTitle');
  if (programTitleElement) {
    programTitleElement.textContent = workoutData.title || 'My Workout';
  }
  
  // Clear existing workouts
  const workoutsContainer = document.getElementById('workouts-container');
  if (workoutsContainer) {
    workoutsContainer.innerHTML = '';
    
    // Render each workout day
    workoutData.days.forEach(day => {
      const dayElement = createWorkoutDayElement(day);
      workoutsContainer.appendChild(dayElement);
    });
  }
  
  // Hide empty state
  const emptyState = document.getElementById('empty-workout-state');
  if (emptyState) {
    emptyState.classList.add('hidden');
  }
}

// Existing helper methods from the original ui.js remain the same...