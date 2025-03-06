// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Configure Cypress for PWA testing
beforeEach(() => {
  // Use cy.session for preserving session state
  cy.session('workout-session', () => {
    // Perform any necessary session setup
    // This could include logging in, setting up initial state, etc.
  }, {
    // Optional configuration for session persistence
    cacheAcrossSpecs: true
  });
  
  // Disable service worker fetch event interception for some tests
  // This allows us to test offline functionality
  if (Cypress.env('disableServiceWorkerFetch')) {
    cy.intercept('**/service-worker.js', (req) => {
      req.reply((res) => {
        const body = res.body.replace(
          'self.addEventListener(\'fetch\'',
          '/* Disabled for testing */ //self.addEventListener(\'fetch\''
        );
        res.send(body);
      });
    });
  }
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  // We want to handle IndexedDB errors gracefully
  if (err.message.includes('IndexedDB') || 
      err.message.includes('UnknownError') ||
      err.message.includes('ServiceWorker')) {
    return false;
  }
  // We still want to fail on other uncaught exceptions
  return true;
});