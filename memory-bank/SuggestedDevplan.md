# Simple Personal Workout PWA Development Plan

Based on your example HTML and CSV workout files, I'll create a simplified development plan for a personal-use PWA that focuses on essential functionality and iPhone optimization.

## Week 1: Core Functionality

### Day 1: Basic Structure
- Set up project with minimal HTML, CSS, and vanilla JavaScript
- Create a simple mobile-first interface
- Example starting structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Simple Workout Tracker</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Simple Workout Tracker</h1>
    </header>
    
    <main>
        <section id="upload-section">
            <h2>Upload Workout Plan</h2>
            <div class="upload-container">
                <input type="file" id="fileInput" accept=".csv,.xlsx,.xls">
                <label for="fileInput">Choose file or drag here</label>
            </div>
        </section>
        
        <section id="workout-section" class="hidden">
            <div id="program-title"></div>
            <div id="program-phase"></div>
            <div id="workouts-container"></div>
        </section>
    </main>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.mini.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### Day 2: File Upload & Processing
- Implement file upload handling
- Add basic Excel/CSV parsing with SheetJS
- Create simple workout data structure

```javascript
// File upload handling
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading state
    document.getElementById('upload-section').classList.add('loading');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        try {
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
            
            if (jsonData && jsonData.length > 0) {
                processWorkoutData(jsonData);
                saveToLocalStorage('lastWorkout', jsonData);
                trackUsage('fileUpload');
            }
        } catch (error) {
            showError('Failed to process file. Please make sure it\'s a valid workout spreadsheet.');
            console.error(error);
        }
        
        document.getElementById('upload-section').classList.remove('loading');
    };
    
    reader.onerror = function() {
        showError('Error reading file');
        document.getElementById('upload-section').classList.remove('loading');
    };
    
    reader.readAsArrayBuffer(file);
}
```

### Day 3-4: Workout Display Implementation
- Create collapsible workout day sections
- Implement mobile-friendly workout table display
- Add exercise detail expansion for small screens

```javascript
function processWorkoutData(data) {
    // Get program info from first rows
    const programTitle = data[0] && data[0][0] ? data[0][0] : 'My Workout Plan';
    const phaseInfo = data[1] && data[1][0] ? data[1][0] : '';
    
    // Initialize containers
    document.getElementById('program-title').textContent = programTitle;
    document.getElementById('program-phase').textContent = phaseInfo;
    
    const workoutsContainer = document.getElementById('workouts-container');
    workoutsContainer.innerHTML = '';
    
    // Process workout days
    let currentDay = null;
    let currentDayElem = null;
    
    // Skip header rows (first 3)
    for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        // Check if this is a new workout day
        if (row[0] && row[0].includes('#')) {
            // Create new workout day section
            currentDay = row[0];
            currentDayElem = createWorkoutDayElement(currentDay);
            workoutsContainer.appendChild(currentDayElem);
            continue;
        }
        
        // Add exercise to current day if we have one
        if (currentDayElem && row[1]) {
            const exerciseElem = createExerciseElement({
                name: row[1],
                warmupSets: row[2],
                workingSets: row[3],
                reps: row[4],
                load: row[5],
                rpe: row[6],
                rest: row[7],
                sub1: row[8],
                sub2: row[9],
                notes: row[10]
            });
            
            currentDayElem.querySelector('.exercises').appendChild(exerciseElem);
        }
    }
    
    // Show workout section
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('workout-section').classList.remove('hidden');
}

function createWorkoutDayElement(dayName) {
    const section = document.createElement('section');
    section.className = 'workout-day';
    
    section.innerHTML = `
        <h3 class="day-title">${dayName}</h3>
        <div class="exercises"></div>
    `;
    
    // Make day title collapsible
    section.querySelector('.day-title').addEventListener('click', () => {
        section.classList.toggle('collapsed');
    });
    
    return section;
}
```

### Day 5: Basic Storage & Simple Tracking
- Implement localStorage for recently viewed workouts
- Add minimal usage tracking
- Create workout history section

```javascript
// Simple tracking functions
function trackUsage(action) {
    const stats = getStats();
    
    switch(action) {
        case 'fileUpload':
            stats.uploads = (stats.uploads || 0) + 1;
            stats.lastUpload = new Date().toISOString();
            break;
        case 'viewWorkout':
            stats.views = (stats.views || 0) + 1;
            stats.lastView = new Date().toISOString();
            break;
        case 'completedExercise':
            stats.completed = (stats.completed || 0) + 1;
            break;
    }
    
    localStorage.setItem('workoutStats', JSON.stringify(stats));
}

function getStats() {
    const stats = localStorage.getItem('workoutStats');
    return stats ? JSON.parse(stats) : {};
}

// Workout storage functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage', e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error parsing localStorage data', e);
        return null;
    }
}
```

## Week 2: PWA Features & UI Enhancement

### Day 6-7: PWA Implementation
- Create manifest.json
- Implement service worker for offline support
- Add app icons

```javascript
// service-worker.js
const CACHE_NAME = 'workout-tracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.mini.min.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          // Don't cache external resources
          if (event.request.url.includes('cdnjs')) {
            return response;
          }
          
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
  );
});
```

### Day 8-9: iPhone UI Optimization
- Implement iPhone-specific styles
- Test and fix iOS Safari issues
- Add touch interactions

```css
/* iPhone-specific CSS */
body {
  /* Respect safe areas for notched phones */
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Fix for 100vh issues in mobile browsers */
.full-height {
  height: 100svh;
}

/* Optimize tap targets */
button, 
.day-title,
.exercise-item {
  min-height: 44px;
  padding: 12px;
}

/* Add momentum scrolling for iOS */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Prevent text selection */
.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* iPhone notch accommodations */
@supports (padding: max(0px)) {
  header {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }
  
  .bottom-controls {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}
```

### Day 10: Exercise Details & Completion Tracking
- Add exercise completion toggle
- Implement exercise detail view for mobile
- Create weight/reps tracking per exercise

## Week 3: Refinement & Personal Features

### Day 11-12: Simple Progress Tracking
- Add weight history chart for exercises
- Implement basic progress indicators
- Create simple stats dashboard

### Day 13: Final UI Polishing
- Refine mobile interactions
- Add visual feedback for completed exercises
- Create light/dark mode toggle

### Day 14: Testing & Bug Fixing
- Test on iPhone Safari
- Fix any remaining issues
- Optimize performance

### Day 15: Final Deployment
- Create final build
- Deploy to Netlify or GitHub Pages
- Verify installation flow on iPhone

## Key Technical Implementations

### Simple Mobile-First Data Display
```css
/* Mobile-first styles */
.workout-day {
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.day-title {
  background: #f4f4f4;
  padding: 12px 16px;
  margin: 0;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.day-title::after {
  content: "▼";
  font-size: 12px;
}

.workout-day.collapsed .exercises {
  display: none;
}

.workout-day.collapsed .day-title::after {
  content: "▶";
}

.exercise-item {
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.exercise-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.exercise-details {
  font-size: 14px;
  color: #666;
}

.exercise-notes {
  font-size: 14px;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

/* Tablet and above */
@media (min-width: 768px) {
  .workout-day {
    max-width: 800px;
    margin: 0 auto 20px;
  }
}
```

### Simple Weight Tracking

```javascript
function trackExerciseWeight(exerciseName, weight, reps) {
  // Get existing tracking data
  const tracking = JSON.parse(localStorage.getItem('exerciseTracking')) || {};
  
  // Initialize exercise entry if needed
  if (!tracking[exerciseName]) {
    tracking[exerciseName] = [];
  }
  
  // Add new entry
  tracking[exerciseName].push({
    date: new Date().toISOString(),
    weight: weight,
    reps: reps
  });
  
  // Keep only last 20 entries
  if (tracking[exerciseName].length > 20) {
    tracking[exerciseName] = tracking[exerciseName].slice(-20);
  }
  
  // Save back to localStorage
  localStorage.setItem('exerciseTracking', JSON.stringify(tracking));
}
```

This simplified plan focuses on creating a personal-use PWA that handles your workout data with minimal complexity while ensuring good iPhone compatibility. The approach uses vanilla JavaScript and minimal dependencies, focusing on core functionality and good mobile experience.

Similar code found with 2 license types