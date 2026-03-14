import { describe, it, expect, beforeEach } from 'vitest'
import { calendarReducer } from './calendar-store'
import type { CalendarDay } from '@/types'

const initialState: CalendarDay[] = [
  {
    date: 5,
    dayOfWeek: 'MON',
    workouts: [],
    isToday: false,
  },
  {
    date: 6,
    dayOfWeek: 'TUE',
    workouts: [
      {
        id: 'workout-1',
        name: 'Chest Day',
        exercises: [
          { id: 'ex-1', name: 'Bench Press', sets: 3, weightInfo: '50 lb x 5' },
          { id: 'ex-2', name: 'Fly', sets: 2, weightInfo: '30 lb x 10' },
        ],
      },
    ],
    isToday: false,
  },
  {
    date: 7,
    dayOfWeek: 'WED',
    workouts: [
      {
        id: 'workout-2',
        name: 'Leg Day',
        exercises: [
          { id: 'ex-3', name: 'Squat', sets: 3, weightInfo: '100 lb x 5' },
        ],
      },
    ],
    isToday: false,
  },
]

describe('calendarReducer', () => {
  let state: CalendarDay[]

  beforeEach(() => {
    state = initialState
  })

  describe('MOVE_WORKOUT', () => {
    it('moves a workout from one day to another', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_WORKOUT',
        workoutId: 'workout-1',
        fromDayIndex: 1,
        toDayIndex: 0,
        toPosition: 0,
      })
      expect(result[1].workouts).toHaveLength(0)
      expect(result[0].workouts).toHaveLength(1)
      expect(result[0].workouts[0].id).toBe('workout-1')
    })

    it('inserts workout at the specified position', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_WORKOUT',
        workoutId: 'workout-1',
        fromDayIndex: 1,
        toDayIndex: 2,
        toPosition: 1,
      })
      expect(result[2].workouts).toHaveLength(2)
      expect(result[2].workouts[0].id).toBe('workout-2')
      expect(result[2].workouts[1].id).toBe('workout-1')
    })

    it('does nothing if workout is not found', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_WORKOUT',
        workoutId: 'nonexistent',
        fromDayIndex: 1,
        toDayIndex: 0,
        toPosition: 0,
      })
      expect(result).toBe(state)
    })
  })

  describe('MOVE_EXERCISE', () => {
    it('moves an exercise between workouts', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_EXERCISE',
        exerciseId: 'ex-1',
        fromWorkoutId: 'workout-1',
        toWorkoutId: 'workout-2',
        toPosition: 0,
      })
      const workout1 = result[1].workouts[0]
      const workout2 = result[2].workouts[0]
      expect(workout1.exercises).toHaveLength(1)
      expect(workout1.exercises[0].id).toBe('ex-2')
      expect(workout2.exercises).toHaveLength(2)
      expect(workout2.exercises[0].id).toBe('ex-1')
      expect(workout2.exercises[1].id).toBe('ex-3')
    })

    it('reorders exercises within the same workout', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_EXERCISE',
        exerciseId: 'ex-2',
        fromWorkoutId: 'workout-1',
        toWorkoutId: 'workout-1',
        toPosition: 0,
      })
      const workout1 = result[1].workouts[0]
      expect(workout1.exercises).toHaveLength(2)
      expect(workout1.exercises[0].id).toBe('ex-2')
      expect(workout1.exercises[1].id).toBe('ex-1')
    })

    it('inserts exercise at specified position', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_EXERCISE',
        exerciseId: 'ex-1',
        fromWorkoutId: 'workout-1',
        toWorkoutId: 'workout-2',
        toPosition: 1,
      })
      const workout2 = result[2].workouts[0]
      expect(workout2.exercises[0].id).toBe('ex-3')
      expect(workout2.exercises[1].id).toBe('ex-1')
    })

    it('does nothing if exercise is not found', () => {
      const result = calendarReducer(state, {
        type: 'MOVE_EXERCISE',
        exerciseId: 'nonexistent',
        fromWorkoutId: 'workout-1',
        toWorkoutId: 'workout-2',
        toPosition: 0,
      })
      expect(result).toBe(state)
    })
  })

  describe('ADD_WORKOUT', () => {
    it('adds a new workout to the specified day', () => {
      const result = calendarReducer(state, {
        type: 'ADD_WORKOUT',
        dayIndex: 0,
        data: { name: 'Push Day' },
      })
      expect(result[0].workouts).toHaveLength(1)
      expect(result[0].workouts[0].name).toBe('Push Day')
      expect(result[0].workouts[0].exercises).toHaveLength(0)
    })

    it('assigns a unique id to the new workout', () => {
      const r1 = calendarReducer(state, { type: 'ADD_WORKOUT', dayIndex: 0, data: { name: 'Push Day' } })
      const r2 = calendarReducer(r1, { type: 'ADD_WORKOUT', dayIndex: 0, data: { name: 'Pull Day' } })
      const ids = r2[0].workouts.map((w) => w.id)
      expect(new Set(ids).size).toBe(2)
    })
  })

  describe('UPDATE_WORKOUT', () => {
    it('updates the workout name', () => {
      const result = calendarReducer(state, {
        type: 'UPDATE_WORKOUT',
        workoutId: 'workout-1',
        data: { name: 'Updated Name' },
      })
      expect(result[1].workouts[0].name).toBe('Updated Name')
    })

    it('does not affect other workouts', () => {
      const result = calendarReducer(state, {
        type: 'UPDATE_WORKOUT',
        workoutId: 'workout-1',
        data: { name: 'Updated' },
      })
      expect(result[2].workouts[0].name).toBe('Leg Day')
    })
  })

  describe('DELETE_WORKOUT', () => {
    it('removes the workout from its day', () => {
      const result = calendarReducer(state, {
        type: 'DELETE_WORKOUT',
        workoutId: 'workout-1',
      })
      expect(result[1].workouts).toHaveLength(0)
    })

    it('does not affect other days', () => {
      const result = calendarReducer(state, {
        type: 'DELETE_WORKOUT',
        workoutId: 'workout-1',
      })
      expect(result[2].workouts).toHaveLength(1)
    })
  })

  describe('ADD_EXERCISE', () => {
    it('adds a new exercise to the specified workout', () => {
      const result = calendarReducer(state, {
        type: 'ADD_EXERCISE',
        workoutId: 'workout-1',
        data: { name: 'Incline Press', sets: 4, weightInfo: '60 lb x 8' },
      })
      const exercises = result[1].workouts[0].exercises
      expect(exercises).toHaveLength(3)
      expect(exercises[2].name).toBe('Incline Press')
      expect(exercises[2].sets).toBe(4)
      expect(exercises[2].weightInfo).toBe('60 lb x 8')
    })
  })

  describe('UPDATE_EXERCISE', () => {
    it('updates the exercise fields', () => {
      const result = calendarReducer(state, {
        type: 'UPDATE_EXERCISE',
        exerciseId: 'ex-1',
        data: { name: 'Flat Press', sets: 5, weightInfo: '70 lb x 5' },
      })
      const ex = result[1].workouts[0].exercises[0]
      expect(ex.name).toBe('Flat Press')
      expect(ex.sets).toBe(5)
      expect(ex.weightInfo).toBe('70 lb x 5')
    })

    it('does not affect other exercises', () => {
      const result = calendarReducer(state, {
        type: 'UPDATE_EXERCISE',
        exerciseId: 'ex-1',
        data: { name: 'Updated', sets: 1, weightInfo: '' },
      })
      expect(result[1].workouts[0].exercises[1].name).toBe('Fly')
    })
  })

  describe('DELETE_EXERCISE', () => {
    it('removes the exercise from its workout', () => {
      const result = calendarReducer(state, {
        type: 'DELETE_EXERCISE',
        exerciseId: 'ex-1',
      })
      expect(result[1].workouts[0].exercises).toHaveLength(1)
      expect(result[1].workouts[0].exercises[0].id).toBe('ex-2')
    })

    it('does not affect exercises in other workouts', () => {
      const result = calendarReducer(state, {
        type: 'DELETE_EXERCISE',
        exerciseId: 'ex-1',
      })
      expect(result[2].workouts[0].exercises).toHaveLength(1)
    })
  })
})
