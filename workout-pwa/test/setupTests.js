// Setup file for Jest testing environment

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

// Mock IndexedDB with more robust implementation
const mockIndexedDB = {
  open: jest.fn(() => ({
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(),
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(true)
      },
      close: jest.fn()
    },
    onsuccess: jest.fn(),
    onerror: jest.fn(),
    onupgradeneeded: jest.fn()
  }))
};

// Global mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

// Mock File and FileReader for testing file uploads
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsArrayBuffer(file) {
    this.result = new ArrayBuffer(file.size);
    if (this.onload) {
      this.onload({ target: { result: this.result } });
    }
  }
}

Object.defineProperty(window, 'FileReader', {
  value: MockFileReader,
  writable: true
});

// Polyfill for File object in test environment
if (!window.File) {
  window.File = class File {
    constructor(parts, name, options = {}) {
      this.parts = parts;
      this.name = name;
      this.type = options.type || '';
      this.size = parts[0] ? parts[0].size || parts[0].length : 0;
    }
  };
}

// Polyfill for Blob in test environment
if (!window.Blob) {
  window.Blob = class Blob {
    constructor(parts, options = {}) {
      this.parts = parts;
      this.type = options.type || '';
      this.size = parts[0] ? parts[0].length : 0;
    }
  };
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});