/**
 * Navigation module for the Workout Tracker PWA
 * Handles page navigation, history, and UI state
 */

// Keep track of navigation history
let pageHistory = ['startPage'];
let currentPage = 'startPage';

/**
 * Initialize navigation
 */
export function initNavigation() {
  // Set up bottom nav click handlers
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      navigateTo(targetPage, false); // Don't add to history when using bottom nav
    });
  });
  
  // Set up back button handlers
  document.getElementById('backToStartBtn').addEventListener('click', () => goBack());
  document.getElementById('backFromWorkoutBtn').addEventListener('click', () => confirmGoBack('workoutPage'));
  document.getElementById('backFromHistoryBtn').addEventListener('click', () => goBack());
  document.getElementById('backFromProgressBtn').addEventListener('click', () => goBack());
  
  // Set up program selection button
  document.getElementById('selectProgramBtn').addEventListener('click', () => navigateTo('programPage'));
  
  // Set up start workout button
  document.getElementById('startWorkoutBtn').addEventListener('click', () => navigateTo('workoutPage'));
  
  // Set up complete workout button
  document.getElementById('completeWorkoutBtn').addEventListener('click', () => {
    showToast('Workout completed! Great job!');
    setTimeout(() => navigateTo('startPage'), 1500);
  });
  
  // Set up segment controls
  document.querySelectorAll('.segment').forEach(segment => {
    segment.addEventListener('click', function() {
      // Find all siblings with the class 'segment'
      const siblings = this.parentElement.querySelectorAll('.segment');
      siblings.forEach(sibling => sibling.classList.remove('active'));
      
      // Add active class to the clicked segment
      this.classList.add('active');
      
      // Fire a custom event for segment change
      const event = new CustomEvent('segmentchange', {
        detail: {
          segment: this.getAttribute('data-segment'),
          container: this.closest('.segmented-control')
        }
      });
      document.dispatchEvent(event);
    });
  });
}

/**
 * Navigate to a specific page
 * @param {string} pageId - The ID of the page to navigate to
 * @param {boolean} addToHistory - Whether to add this page to navigation history
 */
export function navigateTo(pageId, addToHistory = true) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Find and activate the matching nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-page') === pageId) {
      item.classList.add('active');
    }
  });
  
  // Update history if needed
  if (addToHistory) {
    pageHistory.push(currentPage);
  }
  
  // Update current page
  currentPage = pageId;
  
  // Fire a page change event
  const event = new CustomEvent('pagechange', {
    detail: { page: pageId }
  });
  document.dispatchEvent(event);
}

/**
 * Go back to the previous page
 */
export function goBack() {
  if (pageHistory.length > 0) {
    const previousPage = pageHistory.pop();
    navigateTo(previousPage, false); // Don't add to history when going back
  } else {
    navigateTo('startPage', false);
  }
}

/**
 * Confirm before going back if there are unsaved changes
 * @param {string} currentPageId - The current page ID
 */
export function confirmGoBack(currentPageId) {
  // Check if there are unsaved changes
  const hasUnsavedChanges = document.getElementById(currentPageId).getAttribute('data-unsaved') === 'true';
  
  if (hasUnsavedChanges) {
    if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
      goBack();
    }
  } else {
    goBack();
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}