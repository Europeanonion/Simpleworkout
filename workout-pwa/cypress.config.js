const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'workout-pwa',
  
  e2e: {
    baseUrl: 'http://localhost:3002',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Improved browser settings
    browser: 'electron',
    
    // Timeout and retry settings
    defaultCommandTimeout: 15000,
    execTimeout: 60000,
    taskTimeout: 60000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    
    // Retry settings for flaky tests
    retries: {
      runMode: 3,
      openMode: 1
    },
    
    // Environment-specific settings
    env: {
      testDataPath: 'cypress/fixtures',
      DEBUG: true
    },
    
    // Viewport settings for responsive testing
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Experimental features
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSkipDomValidation: true,
    experimentalSessionAndOrigin: false,
    
    // Logging and debugging
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    video: false,
    
    // Detailed logging
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true
    },
    
    setupNodeEvents(on, config) {
      // Add logging for debugging
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });
      
      // Modify port to avoid conflicts
      config.port = 3002;
      
      // Enable more verbose logging
      config.env.DEBUG = true;
      
      return config;
    }
  }
});