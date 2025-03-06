describe('File Upload and Parsing', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    cy.clearIndexedDB();
    
    // Visit the application
    cy.visit('/');
    
    // Wait for the application to load
    cy.get('#fileInput', { timeout: 15000 }).should('be.visible');
  });

  it('should handle Excel files with multiple sheets', () => {
    // Upload an Excel file with multiple sheets
    cy.fixture('sample-workout.xlsx', 'binary').then(fileContent => {
      const blob = new Blob([Cypress.Blob.base64StringToBlob(btoa(fileContent))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const file = new File([blob], 'sample-workout.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Use custom upload command
      cy.get('#fileInput').then(input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        
        // Trigger change event
        cy.wrap(input).trigger('change', { force: true });
      });
      
      // Check for sheet selection modal
      cy.get('#sheet-selection-modal', { timeout: 15000 }).should('be.visible');
      
      // Verify sheet preview is displayed
      cy.get('.sheet-preview').should('be.visible');
      cy.get('.preview-table').should('be.visible');
      
      // Select a specific sheet
      cy.get('.select-sheet-button').first().click();
      
      // Wait for workout section to be visible
      cy.get('#workout-section', { timeout: 15000 })
        .should('be.visible')
        .and('not.have.class', 'hidden');
      
      // Verify workout details
      cy.get('#program-title').should('contain.text');
      cy.get('.workout-day').should('have.length.gt', 0);
    });
  });

  it('should upload and parse a CSV workout file', () => {
    // Upload a test CSV file
    cy.fixture('sample-workout.csv').then(fileContent => {
      const blob = new Blob([fileContent], { type: 'text/csv' });
      const file = new File([blob], 'sample-workout.csv', { type: 'text/csv' });
      
      // Use custom upload command
      cy.get('#fileInput').then(input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        
        // Trigger change event
        cy.wrap(input).trigger('change', { force: true });
      });
      
      // Wait for workout section to be visible
      cy.get('#workout-section', { timeout: 15000 })
        .should('be.visible')
        .and('not.have.class', 'hidden');
      
      // Verify workout details
      cy.get('#program-title').should('contain.text', 'Jeff Nippard PPL Program');
      cy.get('.workout-day').should('have.length.gt', 0);
    });
  });

  it('should save workout data to IndexedDB', () => {
    // Upload a test CSV file
    cy.fixture('sample-workout.csv').then(fileContent => {
      const blob = new Blob([fileContent], { type: 'text/csv' });
      const file = new File([blob], 'sample-workout.csv', { type: 'text/csv' });
      
      // Use custom upload command
      cy.get('#fileInput').then(input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        
        // Trigger change event
        cy.wrap(input).trigger('change', { force: true });
      });
      
      // Wait for workout section to be visible
      cy.get('#workout-section', { timeout: 15000 })
        .should('be.visible')
        .and('not.have.class', 'hidden');
      
      // Check IndexedDB for saved workout
      cy.getFromIndexedDB('workouts').then(workouts => {
        expect(workouts).to.have.length.gt(0);
        const workout = workouts[0];
        expect(workout.title).to.equal('Jeff Nippard PPL Program');
        expect(workout.days).to.be.an('array');
        expect(workout.days[0].exercises).to.be.an('array');
      });
    });
  });

  it('should handle invalid file uploads gracefully', () => {
    // Create an invalid file
    const invalidFile = new File(['Invalid data'], 'invalid.txt', { type: 'text/plain' });
    
    // Upload invalid file
    cy.get('#fileInput').then(input => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      input[0].files = dataTransfer.files;
      
      // Trigger change event
      cy.wrap(input).trigger('change', { force: true });
    });
    
    // Check for error message
    cy.get('#error-message', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Failed to process workout file');
    
    // Verify workout section remains hidden
    cy.get('#workout-section').should('have.class', 'hidden');
  });
  
  it('should allow canceling sheet selection', () => {
    // Upload an Excel file with multiple sheets
    cy.fixture('sample-workout.xlsx', 'binary').then(fileContent => {
      const blob = new Blob([Cypress.Blob.base64StringToBlob(btoa(fileContent))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const file = new File([blob], 'sample-workout.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Use custom upload command
      cy.get('#fileInput').then(input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        
        // Trigger change event
        cy.wrap(input).trigger('change', { force: true });
      });
      
      // Check for sheet selection modal
      cy.get('#sheet-selection-modal', { timeout: 15000 }).should('be.visible');
      
      // Click cancel button
      cy.get('.cancel-button').click();
      
      // Verify modal is closed
      cy.get('#sheet-selection-modal').should('not.exist');
      
      // Verify workout section remains hidden
      cy.get('#workout-section').should('have.class', 'hidden');
    });
  });
});