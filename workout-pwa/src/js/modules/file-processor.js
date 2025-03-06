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
 * @param {string|null} selectedSheet - Optional sheet name to process (for multi-sheet files)
 * @returns {Promise<Object|Array>} - Processed workout data or array of sheet names
 */
export function processFile(file, selectedSheet = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // If there are multiple sheets and no sheet is selected, return the sheet names with previews
        if (workbook.SheetNames.length > 1 && !selectedSheet) {
          const sheetsData = {};
          
          // Generate preview data for each sheet
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const previewData = getSheetPreviewData(sheet);
            sheetsData[sheetName] = previewData;
          });
          
          resolve({
            type: 'multiple_sheets',
            sheetsData: sheetsData
          });
          return;
        }
        
        // Use the selected sheet or default to the first sheet
        const sheetName = selectedSheet || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found in the workbook`);
        }
        
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('No data found in the selected sheet');
        }
        
        // Process the data into our workout format
        const workoutData = processWorkoutData(jsonData);
        
        // Validate the data
        if (validateWorkoutData(workoutData)) {
          // Add the sheet name to the workout data for reference
          workoutData.sheetName = sheetName;
          resolve({
            type: 'workout_data',
            data: workoutData
          });
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
 * Get preview data for a sheet (first few rows)
 * @param {Object} sheet - XLSX sheet object
 * @returns {Array} - 2D array of preview data
 */
function getSheetPreviewData(sheet) {
  // Convert sheet to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Return first 5 rows for preview
  return jsonData.slice(0, 5).map(row => {
    // Limit to first 5 columns for preview
    return row.slice(0, 5);
  });
}

/**
 * Process raw JSON data into workout format
 * @param {Array} data - Raw data from spreadsheet
 * @returns {Object} - Formatted workout data
 */
function processWorkoutData(data) {
  // Trim and clean data rows
  const cleanData = data.map(row => row.map(cell => 
    typeof cell === 'string' ? cell.trim() : cell
  ));

  // Extract program info from first rows
  const programTitle = cleanData[0] && cleanData[0][0] ? cleanData[0][0] : 'My Workout Plan';
  const phaseInfo = cleanData[1] && cleanData[1][0] ? cleanData[1][0] : '';
  
  // Initialize workout data structure
  const workoutData = {
    title: programTitle,
    phase: phaseInfo,
    days: []
  };
  
  // Process workout days
  let currentDay = null;
  
  // Skip header rows (first 3)
  for (let i = 3; i < cleanData.length; i++) {
    const row = cleanData[i];
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
        name: row[1] || '',
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
