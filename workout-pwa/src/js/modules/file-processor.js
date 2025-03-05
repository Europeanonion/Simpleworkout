/**
 * File processor module for workout tracker
 * Handles parsing Excel/CSV files using SheetJS
 */

import * as XLSX from 'xlsx';

/**
 * Schema for validating workout data
 */
const workoutSchema = {
  required: ['title', 'days'],
  properties: {
    title: { type: 'string' },
    phase: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'exercises'],
        properties: {
          name: { type: 'string' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                warmupSets: { type: ['number', 'string'] },
                workingSets: { type: ['number', 'string'] },
                reps: { type: ['number', 'string'] },
                load: { type: ['number', 'string'] },
                rpe: { type: ['number', 'string'] },
                rest: { type: ['number', 'string'] },
                substitution1: { type: 'string' },
                substitution2: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Process file data from an uploaded file
 * @param {File} file - The uploaded file
 * @returns {Promise<Object>} - Processed workout data
 */
export function processFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('No data found in the file');
        }
        
        // Process the data into our workout format
        const workoutData = processWorkoutData(jsonData);
        
        // Validate the data
        if (validateWorkoutData(workoutData)) {
          resolve(workoutData);
        } else {
          reject(new Error('Invalid workout data format'));
        }
      } catch (error) {
        console.error('Error processing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process raw JSON data into workout format
 * @param {Array} data - Raw data from spreadsheet
 * @returns {Object} - Formatted workout data
 */
function processWorkoutData(data) {
  // Extract program info from first rows
  const programTitle = data[0] && data[0][0] ? data[0][0] : 'My Workout Plan';
  const phaseInfo = data[1] && data[1][0] ? data[1][0] : '';
  
  // Initialize workout data structure
  const workoutData = {
    title: programTitle,
    phase: phaseInfo,
    days: []
  };
  
  // Process workout days
  let currentDay = null;
  
  // Skip header rows (first 3)
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // Check if this is a new workout day
    if (row[0] && typeof row[0] === 'string' && row[0].includes('#')) {
      // Create new workout day
      currentDay = {
        name: row[0].trim(),
        exercises: []
      };
      workoutData.days.push(currentDay);
      continue;
    }
    
    // Add exercise to current day if we have one
    if (currentDay && row[1]) {
      const exercise = {
        name: row[1],
        warmupSets: row[2] || '',
        workingSets: row[3] || '',
        reps: row[4] || '',
        load: row[5] || '',
        rpe: row[6] || '',
        rest: row[7] || '',
        substitution1: row[8] || '',
        substitution2: row[9] || '',
        notes: row[10] || ''
      };
      
      currentDay.exercises.push(exercise);
    }
  }
  
  return workoutData;
}

/**
 * Validate workout data against schema
 * @param {Object} data - Workout data to validate
 * @returns {boolean} - Whether the data is valid
 */
function validateWorkoutData(data) {
  // Check required properties
  for (const prop of workoutSchema.required) {
    if (!(prop in data)) {
      console.error(`Missing required property: ${prop}`);
      return false;
    }
  }
  
  // Check days array
  if (!Array.isArray(data.days)) {
    console.error('Days must be an array');
    return false;
  }
  
  // Check each day
  for (const day of data.days) {
    if (!day.name || !Array.isArray(day.exercises)) {
      console.error('Each day must have a name and exercises array');
      return false;
    }
    
    // Check each exercise
    for (const exercise of day.exercises) {
      if (!exercise.name) {
        console.error('Each exercise must have a name');
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Format workout data for display
 * @param {Object} workoutData - Raw workout data
 * @returns {Object} - Formatted workout data
 */
export function formatWorkoutData(workoutData) {
  // Deep clone to avoid modifying the original
  const formattedData = JSON.parse(JSON.stringify(workoutData));
  
  // Format each exercise
  formattedData.days.forEach(day => {
    day.exercises.forEach(exercise => {
      // Format reps for display (e.g., "8-10" or "8")
      if (exercise.reps) {
        exercise.repsFormatted = exercise.reps;
      }
      
      // Format sets for display (e.g., "3 sets")
      if (exercise.workingSets) {
        exercise.setsFormatted = `${exercise.workingSets} sets`;
      }
      
      // Format rest for display (e.g., "60s")
      if (exercise.rest) {
        exercise.restFormatted = exercise.rest;
        if (!exercise.restFormatted.includes('s') && 
            !exercise.restFormatted.includes('min')) {
          exercise.restFormatted += 's';
        }
      }
      
      // Format load for display
      if (exercise.load) {
        exercise.loadFormatted = exercise.load;
      }
    });
  });
  
  return formattedData;
}