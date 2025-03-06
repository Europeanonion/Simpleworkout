/// <reference types="cypress" />

describe('Offline Functionality', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    cy.clearIndexedDB();
    
    // Visit the application
    cy.visit('/');
    
    // Wait for service worker to be registered
    cy.waitForServiceWorker();
    
    // Upload the workout file to set up the test
    cy.uploadFile('#fileInput', 'sample-workout.csv', 'text/csv');
    
    // Wait for processing to complete
    cy.get('#workout-section', { timeout: 10000 }).should('not.have.class', 'hidden');
  });
  
  it('should load the application when offline', () => {
    // First, ensure the app is fully loaded
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    
    // Simulate going offline
    cy.toggleNetworkStatus(false);
    
    // Reload the page
    cy.reload();
    
    // Wait for service worker to handle the request
    cy.waitForServiceWorker();
    
    // Verify the app still loads from cache
    cy.get('#program-title', { timeout: 10000 }).should('be.visible');
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    cy.get('.exercise-item').should('have.length', 5);
    
    // Restore online status
    cy.toggleNetworkStatus(true);
  });
  
  it('should load cached assets when offline', () => {
    // Simulate going offline
    cy.toggleNetworkStatus(false);
    
    // Reload the page
    cy.reload();
    
    // Verify CSS and other assets are loaded from cache
    cy.get('link[href="/css/styles.css"]').should('exist');
    cy.get('#workout-section').should('have.css', 'display').and('not.equal', 'none');
    
    // Restore online status
    cy.toggleNetworkStatus(true);
  });
  
  it('should save progress data when offline', () => {
    // Simulate going offline
    cy.toggleNetworkStatus(false);
    
    // Enter progress for Bench Press
    cy.get('.exercise-item').first().within(() => {
      cy.get('.weight-input').type('200');
      cy.get('.reps-input').type('6');
      cy.get('.save-button').click();
      
      // Verify inputs are cleared (save successful)
      cy.get('.weight-input').should('have.value', '');
      cy.get('.reps-input').should('have.value', '');
    });
    
    // Verify data was saved to IndexedDB
    cy.getFromIndexedDB('exercises').then(exercises => {
      // Find the Bench Press exercise
      const benchPress = exercises.find(ex => ex.name === 'Bench Press');
      expect(benchPress).to.exist;
      
      // Get progress for this exercise
      cy.getFromIndexedDB('progress').then(progressEntries => {
        const benchPressProgress = progressEntries.filter(p => p.exerciseId === benchPress.id);
        expect(benchPressProgress).to.have.length.at.least(1);
        
        const latestProgress = benchPressProgress[0];
        expect(latestProgress.weight).to.equal('200');
        expect(latestProgress.reps).to.equal('6');
      });
    });
    
    // Reload the page while still offline
    cy.reload();
    cy.waitForServiceWorker();
    
    // Verify the app still loads and data persists
    cy.get('#workout-section', { timeout: 10000 }).should('not.have.class', 'hidden');
    
    // Restore online status
    cy.toggleNetworkStatus(true);
  });
  
  it('should handle service worker updates', () => {
    // This test simulates a service worker update
    
    // First, ensure the app is fully loaded
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    
    // Simulate a service worker update by forcing a new registration
    cy.window().then(win => {
      win.navigator.serviceWorker.register('/service-worker.js', { 
        scope: '/',
        updateViaCache: 'none'
      });
    });
    
    // Wait for the service worker to update
    cy.waitForServiceWorker();
    
    // Reload the page
    cy.reload();
    
    // Verify the app still works after the service worker update
    cy.get('#workout-section', { timeout: 10000 }).should('not.have.class', 'hidden');
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
  });
  
  it('should handle IndexedDB operations when offline', () => {
    // Simulate going offline
    cy.toggleNetworkStatus(false);
    
    // Enter progress for multiple exercises
    cy.get('.exercise-item').eq(0).within(() => {
      cy.get('.weight-input').type('195');
      cy.get('.reps-input').type('8');
      cy.get('.save-button').click();
    });
    
    cy.get('.exercise-item').eq(1).within(() => {
      cy.get('.weight-input').type('55');
      cy.get('.reps-input').type('10');
      cy.get('.save-button').click();
    });
    
    // Verify all progress entries were saved
    cy.getFromIndexedDB('progress').then(progressEntries => {
      expect(progressEntries).to.have.length(2);
    });
    
    // Restore online status
    cy.toggleNetworkStatus(true);
  });
});