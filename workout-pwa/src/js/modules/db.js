/**
 * Database module for workout tracker
 * Implements IndexedDB for data storage
 */

// Database configuration
const DB_NAME = 'WorkoutTrackerDB';
const DB_VERSION = 1;
const STORES = {
  WORKOUTS: 'workouts',
  EXERCISES: 'exercises',
  PROGRESS: 'progress'
};

// Initialize the database
export function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Create object stores on database upgrade
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Workouts store - for storing workout programs
      if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
        const workoutStore = db.createObjectStore(STORES.WORKOUTS, { keyPath: 'id', autoIncrement: true });
        workoutStore.createIndex('name', 'name', { unique: false });
        workoutStore.createIndex('date', 'date', { unique: false });
      }
      
      // Exercises store - for storing exercise details
      if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
        const exerciseStore = db.createObjectStore(STORES.EXERCISES, { keyPath: 'id', autoIncrement: true });
        exerciseStore.createIndex('workoutId', 'workoutId', { unique: false });
        exerciseStore.createIndex('name', 'name', { unique: false });
        exerciseStore.createIndex('day', 'day', { unique: false });
      }
      
      // Progress store - for tracking exercise progress
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'id', autoIncrement: true });
        progressStore.createIndex('exerciseId', 'exerciseId', { unique: false });
        progressStore.createIndex('date', 'date', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get database connection
export function getDatabase() {
  return initDatabase();
}

// Save workout program
export async function saveWorkout(workoutData) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.WORKOUTS], 'readwrite');
    const store = transaction.objectStore(STORES.WORKOUTS);
    
    // Add timestamp
    workoutData.date = new Date().toISOString();
    
    const request = store.add(workoutData);
    
    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the ID
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save exercises for a workout
export async function saveExercises(workoutId, exercises) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXERCISES], 'readwrite');
    const store = transaction.objectStore(STORES.EXERCISES);
    
    // Add workoutId to each exercise
    const exercisesWithWorkoutId = exercises.map(exercise => ({
      ...exercise,
      workoutId
    }));
    
    let completed = 0;
    const total = exercisesWithWorkoutId.length;
    const results = [];
    
    exercisesWithWorkoutId.forEach(exercise => {
      const request = store.add(exercise);
      
      request.onsuccess = (event) => {
        results.push(event.target.result);
        completed++;
        
        if (completed === total) {
          resolve(results);
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

// Get all workouts
export async function getWorkouts() {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.WORKOUTS], 'readonly');
    const store = transaction.objectStore(STORES.WORKOUTS);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Get a specific workout by ID
export async function getWorkout(id) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.WORKOUTS], 'readonly');
    const store = transaction.objectStore(STORES.WORKOUTS);
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Get exercises for a specific workout
export async function getExercisesByWorkout(workoutId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXERCISES], 'readonly');
    const store = transaction.objectStore(STORES.EXERCISES);
    const index = store.index('workoutId');
    const request = index.getAll(workoutId);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save progress for an exercise
export async function saveProgress(exerciseId, weight, reps, notes = '') {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROGRESS], 'readwrite');
    const store = transaction.objectStore(STORES.PROGRESS);
    
    const progressData = {
      exerciseId,
      weight,
      reps,
      notes,
      date: new Date().toISOString()
    };
    
    const request = store.add(progressData);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Get progress history for an exercise
export async function getProgressHistory(exerciseId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROGRESS], 'readonly');
    const store = transaction.objectStore(STORES.PROGRESS);
    const index = store.index('exerciseId');
    const request = index.getAll(exerciseId);
    
    request.onsuccess = (event) => {
      // Sort by date, newest first
      const results = event.target.result.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      resolve(results);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Delete a workout and all associated exercises and progress
export async function deleteWorkout(workoutId) {
  const db = await getDatabase();
  
  // First get all exercises for this workout
  const exercises = await getExercisesByWorkout(workoutId);
  const exerciseIds = exercises.map(ex => ex.id);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.WORKOUTS, STORES.EXERCISES, STORES.PROGRESS], 'readwrite');
    
    // Delete the workout
    const workoutStore = transaction.objectStore(STORES.WORKOUTS);
    workoutStore.delete(workoutId);
    
    // Delete all exercises for this workout
    const exerciseStore = transaction.objectStore(STORES.EXERCISES);
    const exerciseIndex = exerciseStore.index('workoutId');
    const exerciseRequest = exerciseIndex.getAll(workoutId);
    
    exerciseRequest.onsuccess = () => {
      const exercises = exerciseRequest.result;
      
      // Delete each exercise
      exercises.forEach(exercise => {
        exerciseStore.delete(exercise.id);
      });
      
      // Delete all progress entries for these exercises
      const progressStore = transaction.objectStore(STORES.PROGRESS);
      
      // For each exercise, delete its progress
      exerciseIds.forEach(exerciseId => {
        const progressIndex = progressStore.index('exerciseId');
        const progressRequest = progressIndex.getAll(exerciseId);
        
        progressRequest.onsuccess = () => {
          const progressEntries = progressRequest.result;
          
          // Delete each progress entry
          progressEntries.forEach(entry => {
            progressStore.delete(entry.id);
          });
        };
      });
    };
    
    transaction.oncomplete = () => {
      resolve(true);
    };
    
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Get the most recent workout
export async function getMostRecentWorkout() {
  const workouts = await getWorkouts();
  
  if (workouts.length === 0) {
    return null;
  }
  
  // Sort by date, newest first
  workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return workouts[0];
}