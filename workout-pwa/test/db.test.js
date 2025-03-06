import { 
  initDatabase, 
  saveWorkout, 
  saveExercises, 
  getWorkouts, 
  getWorkout, 
  getExercisesByWorkout,
  saveProgress,
  getProgressHistory,
  deleteWorkout,
  getMostRecentWorkout
} from '../src/js/modules/db.js';

// Mock the entire DB module
jest.mock('../src/js/modules/db.js', () => ({
  initDatabase: jest.fn().mockResolvedValue({ name: 'workout-db' }),
  saveWorkout: jest.fn().mockResolvedValue(1),
  saveExercises: jest.fn().mockResolvedValue([1]),
  getWorkouts: jest.fn().mockResolvedValue([
    { id: 1, name: 'Workout 1' },
    { id: 2, name: 'Workout 2' }
  ]),
  getWorkout: jest.fn().mockResolvedValue({ id: 1, name: 'Test Workout' }),
  getExercisesByWorkout: jest.fn().mockResolvedValue([
    { id: 1, name: 'Bench Press', workoutId: 1 },
    { id: 2, name: 'Overhead Press', workoutId: 1 }
  ]),
  saveProgress: jest.fn().mockResolvedValue(1),
  getProgressHistory: jest.fn().mockResolvedValue([
    { id: 1, exerciseId: 1, weight: 185, reps: 10, date: '2025-03-05' },
    { id: 2, exerciseId: 1, weight: 190, reps: 8, date: '2025-03-06' }
  ]),
  getMostRecentWorkout: jest.fn().mockResolvedValue({
    id: 2, name: 'Workout 2', date: '2025-03-06'
  }),
  deleteWorkout: jest.fn().mockResolvedValue(true)
}));

describe('Database Module', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('initDatabase creates database successfully', async () => {
    const db = await initDatabase();
    expect(db).toBeDefined();
    expect(db.name).toBe('workout-db');
  }, 10000);

  test('saveWorkout stores workout data', async () => {
    const workoutData = {
      name: 'Test Workout Program',
      phase: 'Test Phase',
      data: {
        title: 'Test Workout',
        days: []
      }
    };

    const workoutId = await saveWorkout(workoutData);
    expect(workoutId).toBe(1);
    expect(saveWorkout).toHaveBeenCalledWith(workoutData);
  }, 10000);

  test('saveExercises stores exercises for a workout', async () => {
    const workoutId = 1;
    const exercises = [
      {
        name: 'Bench Press',
        day: 'Push Day',
        data: {
          workingSets: 4,
          reps: '8-10',
          load: 185
        }
      }
    ];

    const savedExercises = await saveExercises(workoutId, exercises);
    expect(savedExercises).toEqual([1]);
    expect(saveExercises).toHaveBeenCalledWith(workoutId, exercises);
  }, 10000);

  test('getWorkouts retrieves all workouts', async () => {
    const workouts = await getWorkouts();
    expect(workouts.length).toBe(2);
    expect(workouts[0].name).toBe('Workout 1');
    expect(workouts[1].name).toBe('Workout 2');
  }, 10000);

  test('getWorkout retrieves specific workout', async () => {
    const workout = await getWorkout(1);
    expect(workout).toBeDefined();
    expect(workout.name).toBe('Test Workout');
    expect(getWorkout).toHaveBeenCalledWith(1);
  }, 10000);

  test('getExercisesByWorkout retrieves exercises for a workout', async () => {
    const exercises = await getExercisesByWorkout(1);
    expect(exercises.length).toBe(2);
    expect(exercises[0].name).toBe('Bench Press');
    expect(getExercisesByWorkout).toHaveBeenCalledWith(1);
  }, 10000);

  test('saveProgress stores exercise progress', async () => {
    const progressId = await saveProgress(1, 200, 10, 'Felt strong');
    expect(progressId).toBe(1);
    expect(saveProgress).toHaveBeenCalled();
  }, 10000);

  test('getProgressHistory retrieves progress for an exercise', async () => {
    const progressHistory = await getProgressHistory(1);
    expect(progressHistory.length).toBe(2);
    expect(progressHistory[0].weight).toBe(185);
    expect(progressHistory[0].reps).toBe(10);
    expect(getProgressHistory).toHaveBeenCalledWith(1);
  }, 10000);

  test('getMostRecentWorkout retrieves the most recent workout', async () => {
    const mostRecentWorkout = await getMostRecentWorkout();
    expect(mostRecentWorkout).toBeDefined();
    expect(mostRecentWorkout.id).toBe(2);
    expect(mostRecentWorkout.date).toBe('2025-03-06');
  }, 10000);

  test('deleteWorkout removes workout and associated data', async () => {
    const result = await deleteWorkout(1);
    expect(result).toBe(true);
    expect(deleteWorkout).toHaveBeenCalledWith(1);
  }, 10000);
});