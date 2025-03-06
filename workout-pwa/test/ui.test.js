import { 
  renderWorkout, 
  showError, 
  showLoading,
  initUI
} from '../src/js/modules/ui.js';

describe('UI Module', () => {
  let container;

  beforeEach(() => {
    // Create a container for testing UI rendering
    container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = `
      <div id="upload-section"></div>
      <div id="workout-section" class="hidden"></div>
      <div id="program-title"></div>
      <div id="program-phase"></div>
      <div id="workouts-container"></div>
    `;
  });

  afterEach(() => {
    // Clean up the container after each test
    document.body.removeChild(container);
  });

  test('renderWorkout displays workout data correctly', () => {
    const workoutData = {
      title: 'Test Workout Program',
      phase: 'Hypertrophy',
      days: [
        {
          name: '#Push Day',
          exercises: [
            {
              name: 'Bench Press',
              workingSets: '4',
              reps: '8-10',
              load: '185',
              rest: '90s',
              notes: 'Focus on chest contraction'
            },
            {
              name: 'Overhead Press',
              workingSets: '3',
              reps: '8-10',
              load: '95',
              rest: '75s'
            }
          ]
        }
      ]
    };

    renderWorkout(workoutData);

    // Check program info
    expect(document.getElementById('program-title').textContent).toBe('Test Workout Program');
    expect(document.getElementById('program-phase').textContent).toBe('Hypertrophy');

    // Check workout day rendering
    const workoutsContainer = document.getElementById('workouts-container');
    expect(workoutsContainer.children.length).toBe(1);

    const dayElement = workoutsContainer.children[0];
    expect(dayElement.querySelector('.day-title').textContent).toBe('#Push Day');

    // Check exercises rendering
    const exerciseElements = dayElement.querySelectorAll('.exercise-item');
    expect(exerciseElements.length).toBe(2);

    const benchPressElement = exerciseElements[0];
    expect(benchPressElement.querySelector('.exercise-name').textContent).toBe('Bench Press');
    expect(benchPressElement.querySelector('.exercise-details').textContent).toContain('4 sets');
    expect(benchPressElement.querySelector('.exercise-details').textContent).toContain('8-10');
    expect(benchPressElement.querySelector('.exercise-notes').textContent).toBe('Focus on chest contraction');
  });

  test('showError displays error message', () => {
    const errorMessage = 'Test error message';
    showError(errorMessage);

    const errorElement = document.getElementById('error-message');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toBe(errorMessage);
    expect(errorElement.classList.contains('show')).toBe(true);
  });

  test('showLoading toggles loading state', () => {
    const uploadSection = document.getElementById('upload-section');

    // Test loading state on
    showLoading(true);
    expect(uploadSection.classList.contains('loading')).toBe(true);

    // Test loading state off
    showLoading(false);
    expect(uploadSection.classList.contains('loading')).toBe(false);
  });

  test('renderWorkout handles empty workout data', () => {
    const emptyWorkoutData = {
      title: '',
      phase: '',
      days: []
    };

    renderWorkout(emptyWorkoutData);

    const workoutsContainer = document.getElementById('workouts-container');
    expect(workoutsContainer.children.length).toBe(0);
    expect(document.getElementById('program-title').textContent).toBe('My Workout');
    expect(document.getElementById('program-phase').textContent).toBe('');
  });

  test('renderWorkout handles workout with no exercises', () => {
    const workoutWithNoExercises = {
      title: 'Test Workout',
      phase: 'Test Phase',
      days: [
        {
          name: '#Test Day',
          exercises: []
        }
      ]
    };

    renderWorkout(workoutWithNoExercises);

    const workoutsContainer = document.getElementById('workouts-container');
    expect(workoutsContainer.children.length).toBe(1);

    const dayElement = workoutsContainer.children[0];
    expect(dayElement.querySelector('.day-title').textContent).toBe('#Test Day');
    expect(dayElement.querySelectorAll('.exercise-item').length).toBe(0);
  });

  test('UI sections visibility changes after rendering', () => {
    const workoutData = {
      title: 'Test Workout',
      phase: 'Test Phase',
      days: [{ name: 'Test Day', exercises: [] }]
    };

    renderWorkout(workoutData);

    const uploadSection = document.getElementById('upload-section');
    const workoutSection = document.getElementById('workout-section');

    expect(uploadSection.classList.contains('hidden')).toBe(true);
    expect(workoutSection.classList.contains('hidden')).toBe(false);
  });
});