/// <reference types="cypress" />

describe('Workout Display and Navigation', () => {
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
  
  it('should display workout days and exercises correctly', () => {
    // Verify program info
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    cy.get('#program-phase').should('contain', 'Hypertrophy');
    
    // Verify workout days
    cy.get('.workout-day').should('have.length', 1);
    cy.get('.day-title').first().should('contain', '#Push Day A');
    
    // Verify exercises
    cy.get('.exercise-item').should('have.length', 5);
    
    // Check first exercise details
    cy.get('.exercise-item').first().within(() => {
      cy.get('.exercise-name').should('contain', 'Bench Press');
      cy.get('.detail-item').should('have.length.at.least', 4);
      cy.contains('Sets: 4 sets');
      cy.contains('Reps: 8-10');
      cy.contains('Load: 185');
      cy.contains('Rest: 90s');
      cy.get('.exercise-notes').should('contain', 'Focus on chest contraction');
    });
    
    // Check second exercise details
    cy.get('.exercise-item').eq(1).within(() => {
      cy.get('.exercise-name').should('contain', 'Incline Dumbbell Press');
      cy.contains('Sets: 3 sets');
      cy.contains('Reps: 10-12');
      cy.contains('Load: 50');
      cy.get('.exercise-notes').should('contain', 'Maintain strict form');
    });
  });
  
  it('should allow collapsing and expanding workout days', () => {
    // Initially, the workout day should be expanded
    cy.get('.workout-day').first().find('.exercises').should('be.visible');
    
    // Click on the day title to collapse
    cy.get('.day-title').first().click();
    
    // Verify the day is collapsed
    cy.get('.workout-day').first().should('have.class', 'collapsed');
    
    // Click again to expand
    cy.get('.day-title').first().click();
    
    // Verify the day is expanded
    cy.get('.workout-day').first().should('not.have.class', 'collapsed');
    cy.get('.workout-day').first().find('.exercises').should('be.visible');
  });
  
  it('should load previously saved workout on page refresh', () => {
    // Verify the workout is loaded
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    
    // Refresh the page
    cy.reload();
    
    // Wait for service worker to be registered again
    cy.waitForServiceWorker();
    
    // Verify the workout is still displayed after refresh
    cy.get('#workout-section', { timeout: 10000 }).should('not.have.class', 'hidden');
    cy.get('#program-title').should('contain', 'Jeff Nippard PPL Program');
    cy.get('.exercise-item').should('have.length', 5);
  });
  
  it('should display exercise progress tracking inputs', () => {
    // Check that each exercise has progress tracking inputs
    cy.get('.exercise-item').each(($exercise) => {
      cy.wrap($exercise).within(() => {
        cy.get('.exercise-progress').should('exist');
        cy.get('.weight-input').should('exist');
        cy.get('.reps-input').should('exist');
        cy.get('.save-button').should('exist');
      });
    });
  });
});