/**
 * Program Manager for SimpleWorkout PWA
 * Handles workout program management and organization
 */
import * as DB from './db.js';

// Store the current selected program
let currentProgram = null;

// Define object store name constants
const STORES = {
  PROGRAMS: 'programs',
  PHASES: 'phases'
};

/**
 * Initialize program manager
 * @return {Promise<boolean>} - Whether initialization was successful
 */
export async function init() {
  try {
    // Initialize program-related DB stores if needed
    await initializeStores();
    
    // Load most recent program
    const mostRecent = await getMostRecentProgram();
    if (mostRecent) {
      currentProgram = mostRecent;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to initialize program manager:', error);
    return false;
  }
}

/**
 * Initialize database stores for programs if they don't exist
 */
async function initializeStores() {
  // Check if stores already exist
  const storesExist = await DB.checkStores([STORES.PROGRAMS, STORES.PHASES]);
  
  if (!storesExist) {
    // If stores don't exist, create them in the next DB version
    await DB.updateSchema(db => {
      // Create programs store
      if (!db.objectStoreNames.contains(STORES.PROGRAMS)) {
        const programStore = db.createObjectStore(STORES.PROGRAMS, { keyPath: 'id', autoIncrement: true });
        programStore.createIndex('name', 'name', { unique: false });
        programStore.createIndex('lastUsed', 'lastUsed', { unique: false });
      }
      
      // Create phases store
      if (!db.objectStoreNames.contains(STORES.PHASES)) {
        const phaseStore = db.createObjectStore(STORES.PHASES, { keyPath: 'id', autoIncrement: true });
        phaseStore.createIndex('programId', 'programId', { unique: false });
      }
    });
  }
}

/**
 * Get most recently used program
 * @return {Promise<Object|null>} Most recent program or null
 */
export async function getMostRecentProgram() {
  try {
    const programs = await DB.getAll(STORES.PROGRAMS);
    
    if (programs && programs.length > 0) {
      // Sort by lastUsed date, descending
      programs.sort((a, b) => {
        const dateA = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
        const dateB = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
        return dateB - dateA;
      });
      
      return programs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting most recent program:', error);
    return null;
  }
}

/**
 * Get all available programs
 * @return {Promise<Array>} Array of programs
 */
export async function getPrograms() {
  try {
    return await DB.getAll(STORES.PROGRAMS);
  } catch (error) {
    console.error('Error getting programs:', error);
    return [];
  }
}

/**
 * Select a program by ID or name
 * @param {number|string} identifier - Program ID or name
 * @return {Promise<Object|null>} - Selected program or null
 */
export async function selectProgram(identifier) {
  try {
    let program = null;
    
    if (typeof identifier === 'number') {
      // Get by ID
      program = await DB.get(STORES.PROGRAMS, identifier);
    } else {
      // Get by name
      const programs = await getPrograms();
      program = programs.find(p => p.name === identifier);
    }
    
    if (!program) {
      throw new Error(`Program not found: ${identifier}`);
    }
    
    // Update lastUsed timestamp
    program.lastUsed = new Date().toISOString();
    await DB.put(STORES.PROGRAMS, program);
    
    // Update current program
    currentProgram = program;
    
    return program;
  } catch (error) {
    console.error('Error selecting program:', error);
    return null;
  }
}

/**
 * Get current program
 * @returns {Object|null} Current program or null
 */
export function getCurrentProgram() {
  return currentProgram;
}

/**
 * Create default programs for new users
 * @returns {Promise<boolean>} Success status
 */
export async function createDefaultPrograms() {
  try {
    // Define default program templates
    const defaultPrograms = [
      {
        name: 'Push Pull Legs 6x',
        description: '6-day split focusing on push, pull and leg workouts',
        level: 'intermediate',
        type: 'hypertrophy',
        daysPerWeek: 6,
        created: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        phases: [
          {
            name: 'Phase 1 - Base Hypertrophy',
            weeks: 4,
            days: [
              { name: 'Push Day', tags: ['chest', 'shoulders', 'triceps'] },
              { name: 'Pull Day', tags: ['back', 'biceps', 'rear delts'] },
              { name: 'Legs Day', tags: ['quads', 'hamstrings', 'calves'] }
              // Additional days would be defined here
            ]
          }
        ]
      },
      {
        name: 'Full Body 3x',
        description: '3-day full body workout for all fitness levels',
        level: 'beginner',
        type: 'strength',
        daysPerWeek: 3,
        created: new Date().toISOString(),
        lastUsed: null,
        phases: [
          {
            name: 'Phase 1 - Foundation',
            weeks: 4,
            days: [
              { name: 'Workout A', tags: ['full body', 'compound'] },
              { name: 'Workout B', tags: ['full body', 'compound'] },
              { name: 'Workout C', tags: ['full body', 'compound'] }
            ]
          }
        ]
      }
      // Additional default programs would be defined here
    ];
    
    // Save programs to database
    for (const program of defaultPrograms) {
      await DB.add(STORES.PROGRAMS, program);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating default programs:', error);
    return false;
  }
}