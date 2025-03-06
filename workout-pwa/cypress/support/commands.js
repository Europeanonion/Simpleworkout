// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- File Upload Command --
Cypress.Commands.add('uploadFile', (selector, filePath, mimeType = '') => {
  return cy.get(selector).then(subject => {
    cy.fixture(filePath, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(blob => {
        const el = subject[0];
        const testFile = new File([blob], filePath.split('/').pop(), { type: mimeType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        return cy.wrap(subject).trigger('change', { force: true });
      });
  });
});

// -- Service Worker Command --
Cypress.Commands.add('waitForServiceWorker', () => {
  return cy.window().then(win => {
    return new Cypress.Promise((resolve, reject) => {
      // Set a timeout to prevent indefinite waiting
      const timeout = setTimeout(() => {
        reject(new Error('Service worker registration timed out'));
      }, 10000); // 10 seconds timeout

      // Check if service worker is already registered
      if (win.navigator.serviceWorker.controller) {
        clearTimeout(timeout);
        resolve(win.navigator.serviceWorker.controller);
        return;
      }

      // Listen for service worker registration
      win.navigator.serviceWorker.ready
        .then(registration => {
          clearTimeout(timeout);
          resolve(registration.active);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });

      // Fallback event listener
      win.navigator.serviceWorker.addEventListener('controllerchange', () => {
        clearTimeout(timeout);
        resolve(win.navigator.serviceWorker.controller);
      }, { once: true });
    });
  });
});

// -- IndexedDB Commands --
Cypress.Commands.add('clearIndexedDB', () => {
  return cy.window().then(win => {
    return new Cypress.Promise((resolve, reject) => {
      const req = win.indexedDB.deleteDatabase('WorkoutTrackerDB');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('Database blocked'));
    });
  });
});

Cypress.Commands.add('getFromIndexedDB', (storeName, key) => {
  return cy.window().then(win => {
    return new Cypress.Promise((resolve, reject) => {
      const request = win.indexedDB.open('WorkoutTrackerDB');
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const getRequest = key ? store.get(key) : store.getAll();
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result);
          db.close();
        };
        
        getRequest.onerror = () => {
          reject(getRequest.error);
          db.close();
        };
      };
    });
  });
});

// -- Network Commands --
Cypress.Commands.add('toggleNetworkStatus', (online) => {
  return cy.window().then(win => {
    // Mock navigator.onLine property
    Object.defineProperty(win.navigator, 'onLine', {
      configurable: true,
      get: function() { return online; }
    });
    
    // Dispatch appropriate event
    const eventName = online ? 'online' : 'offline';
    const event = new win.Event(eventName);
    win.dispatchEvent(event);
  });
});