# Workout PWA

A Progressive Web Application for tracking workout routines and exercise progress.

## Features

- Upload and parse workout routines from CSV files
- View workout programs with exercises, sets, reps, and other details
- Track exercise progress over time
- Works offline with service worker caching
- Stores data locally using IndexedDB

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the application:

```bash
npm run build
```

4. Start the development server:

```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm run dev` - Start the development server with hot reloading

### Testing

#### Unit Tests

The application uses Jest for unit testing:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### End-to-End Tests

The application uses Cypress for end-to-end testing:

```bash
# Run Cypress tests in headless mode
npm run test:e2e

# Run Cypress tests in explicitly headless mode (for environments without Xvfb)
npm run test:e2e:headless

# Open Cypress UI for interactive testing
npm run test:e2e:open
```

> **Note:** Running Cypress with a GUI requires the Xvfb dependency on Linux systems without a display server. If you encounter an error about missing Xvfb, you can either:
> 1. Install Xvfb: `sudo apt-get update && sudo apt-get install -y xvfb`
> 2. Run tests in headless mode only: `npm run test:e2e`
> 3. Use the Cypress Docker image which includes all dependencies: [cypress/included](https://hub.docker.com/r/cypress/included)
>
> **Troubleshooting:**
> - If you encounter an `EADDRINUSE` error (address already in use), make sure no other server is running on port 3000:
>   ```bash
>   # Find processes using port 3000
>   lsof -i :3000
>
>   # Kill the process
>   kill -9 <PID>
>   ```
> - For CI environments, you may need to modify the Cypress configuration to use a different port or add retry logic.

The E2E tests cover the following functionality:

1. **File Upload and Parsing**
   - CSV file upload
   - Workout data parsing
   - Error handling for invalid files

2. **Workout Display and Navigation**
   - Rendering of workout data
   - Collapsing/expanding workout days
   - Persistence of workout data

3. **Exercise Progress Tracking**
   - Saving exercise progress data
   - Validation of progress inputs
   - Multiple exercise progress entries

4. **Offline Functionality**
   - Application loading when offline
   - Caching of assets
   - IndexedDB operations when offline
   - Service worker updates

For more details on the Cypress tests, see the [Cypress README](./cypress/README.md).

## Project Structure

- `public/` - Static assets and HTML entry point
  - `css/` - Stylesheets
  - `icons/` - Application icons
  - `service-worker.js` - Service worker for offline functionality
- `src/` - Source code
  - `js/` - JavaScript modules
    - `modules/` - Core application modules
      - `db.js` - IndexedDB database operations
      - `file-processor.js` - CSV file parsing
      - `ui.js` - UI rendering and interactions
    - `app.js` - Main application entry point
- `test/` - Jest unit tests
  - `test-data/` - Sample data for testing
- `cypress/` - Cypress end-to-end tests
  - `e2e/` - Test specifications
  - `fixtures/` - Test data
  - `support/` - Test helpers and commands

## Continuous Integration

This project uses GitHub Actions for continuous integration. The CI pipeline runs both Jest unit tests and Cypress end-to-end tests on every push to the main branch and on pull requests.

## License

This project is licensed under the ISC License.