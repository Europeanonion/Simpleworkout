# Cypress E2E Tests for Workout PWA

This directory contains end-to-end tests for the Workout PWA application using Cypress. These tests verify the core functionality of the application in a real browser environment.

## Test Structure

The tests are organized into the following categories:

1. **File Upload and Parsing** (`file-upload.cy.js`)
   - Tests the CSV file upload functionality
   - Verifies proper parsing of workout data
   - Tests error handling for invalid files

2. **Workout Display and Navigation** (`workout-display.cy.js`)
   - Tests the rendering of workout data
   - Tests collapsing/expanding workout days
   - Tests persistence of workout data on page refresh

3. **Exercise Progress Tracking** (`progress-tracking.cy.js`)
   - Tests saving exercise progress data
   - Tests validation of progress inputs
   - Tests multiple exercise progress entries

4. **Offline Functionality** (`offline-functionality.cy.js`)
   - Tests application loading when offline
   - Tests caching of assets
   - Tests IndexedDB operations when offline
   - Tests service worker updates

## Running the Tests

You can run the Cypress tests using the following npm scripts:

```bash
# Run tests in headless mode
npm run test:e2e

# Run tests in explicitly headless mode (for environments without Xvfb)
npm run test:e2e:headless

# Open Cypress UI for interactive testing
npm run test:e2e:open
```

These commands will start the development server and run the tests against it.

### Dependencies

When running Cypress in environments without a display server (like CI environments or containers), you'll need the Xvfb dependency for GUI mode:

```bash
# On Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y xvfb

# On CentOS/RHEL
sudo yum install -y xorg-x11-server-Xvfb
```

Alternatively, you can:
1. Run tests in headless mode only (`npm run test:e2e`)
2. Use the official Cypress Docker image which includes all dependencies: [cypress/included](https://hub.docker.com/r/cypress/included)

### Troubleshooting Common Issues

#### Port Already in Use

If you encounter an `EADDRINUSE` error when running tests:

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

This means another process is already using port 3000. To resolve:

1. Find the process using the port:
   ```bash
   lsof -i :3000
   # or
   netstat -tulpn | grep 3000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Try running the tests again

#### Xvfb Missing in CI Environments

For CI environments without a display server, you have several options:

1. Install Xvfb in your CI pipeline:
   ```yaml
   # In GitHub Actions workflow
   - name: Install Xvfb
     run: sudo apt-get update && sudo apt-get install -y xvfb
   ```

2. Run Cypress in headless mode by modifying the test command:
   ```bash
   cypress run --headless
   ```

3. Use the Cypress Docker image in your CI pipeline:
   ```yaml
   # In GitHub Actions workflow
   - name: Cypress run
     uses: cypress-io/github-action@v5
     with:
       browser: chrome
       headless: true
   ```

## Test Configuration

The Cypress configuration is defined in `cypress.config.js` in the project root. Key configurations include:

- Base URL: `http://localhost:3000`
- Service worker testing enabled
- Custom commands for file upload, IndexedDB access, and offline testing

## Custom Commands

Several custom Cypress commands have been created to facilitate testing:

- `cy.uploadFile()` - Uploads a file to a file input
- `cy.waitForServiceWorker()` - Waits for the service worker to be registered
- `cy.clearIndexedDB()` - Clears the IndexedDB database
- `cy.getFromIndexedDB()` - Retrieves data from IndexedDB
- `cy.toggleNetworkStatus()` - Simulates online/offline network status

## Test Data

The tests use a sample workout CSV file located in the `cypress/fixtures` directory. This file contains a workout program with exercises, sets, reps, and other details.