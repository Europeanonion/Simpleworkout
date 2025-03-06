/// <reference types="cypress" />

describe('Exercise Progress Tracking', () => {
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
  
  it('should save exercise progress data', () => {
    // Select the first exercise (Bench Press)
    cy.get('.exercise-item').first().within(() => {
      // Enter progress data
      cy.get('.weight-input').type('195');
      cy.get('.reps-input').type('8');
      cy.get('.save-button').click();
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
        expect(latestProgress.weight).to.equal('195');
        expect(latestProgress.reps).to.equal('8');
      });
    });
  });
  
  it('should save progress for multiple exercises', () => {
    // Enter progress for Bench Press
    cy.get('.exercise-item').eq(0).within(() => {
      cy.get('.weight-input').type('195');
      cy.get('.reps-input').type('8');
      cy.get('.save-button').click();
    });
    
    // Enter progress for Incline Dumbbell Press
    cy.get('.exercise-item').eq(1).within(() => {
      cy.get('.weight-input').type('55');
      cy.get('.reps-input').type('10');
      cy.get('.save-button').click();
    });
    
    // Enter progress for Overhead Press
    cy.get('.exercise-item').eq(2).within(() => {
      cy.get('.weight-input').type('100');
      cy.get('.reps-input').type('9');
      cy.get('.save-button').click();
    });
    
    // Verify all progress entries were saved
    cy.getFromIndexedDB('progress').then(progressEntries => {
      expect(progressEntries).to.have.length(3);
    });
  });
  
  it('should clear input fields after saving progress', () => {
    // Enter and save progress
    cy.get('.exercise-item').first().within(() => {
      cy.get('.weight-input').type('195');
      cy.get('.reps-input').type('8');
      cy.get('.save-button').click();
      
      // Verify inputs are cleared
      cy.get('.weight-input').should('have.value', '');
      cy.get('.reps-input').should('have.value', '');
    });
  });
  
  it('should handle invalid progress data gracefully', () => {
    // Try to save with missing weight
    cy.get('.exercise-item').first().within(() => {
      // Only enter reps, not weight
      cy.get('.reps-input').type('8');
      cy.get('.save-button').click();
      
      // Verify inputs are not cleared (save didn't happen)
      cy.get('.reps-input').should('have.value', '8');
    });
    
    // Verify no progress was saved
    cy.getFromIndexedDB('progress').then(progressEntries => {
      expect(progressEntries).to.have.length(0);
    });
    
    // Try to save with missing reps
    cy.get('.exercise-item').first().within(() => {
      // Clear previous input and only enter weight
      cy.get('.reps-input').clear();
      cy.get('.weight-input').type('195');
      cy.get('.save-button').click();
      
      // Verify inputs are not cleared (save didn't happen)
      cy.get('.weight-input').should('have.value', '195');
    });
    
    // Verify no progress was saved
    cy.getFromIndexedDB('progress').then(progressEntries => {
      expect(progressEntries).to.have.length(0);
    });
  });
});