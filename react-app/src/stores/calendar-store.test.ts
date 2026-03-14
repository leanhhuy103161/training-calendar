import { describe, it, expect, beforeEach } from 'vitest'
import { useCalendarStore } from './calendar-store'

describe('useCalendarStore', () => {
  beforeEach(() => {
    useCalendarStore.setState({
      week: [
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
      ],
    })
  })

  describe('moveWorkout', () => {
    it('moves a workout from one day to another', () => {
      const { moveWorkout } = useCalendarStore.getState()
      moveWorkout('workout-1', 1, 0, 0)

      const { week } = useCalendarStore.getState()
      expect(week[1].workouts).toHaveLength(0)
      expect(week[0].workouts).toHaveLength(1)
      expect(week[0].workouts[0].id).toBe('workout-1')
    })

    it('inserts workout at the specified position', () => {
      const { moveWorkout } = useCalendarStore.getState()
      moveWorkout('workout-1', 1, 2, 1)

      const { week } = useCalendarStore.getState()
      expect(week[2].workouts).toHaveLength(2)
      expect(week[2].workouts[0].id).toBe('workout-2')
      expect(week[2].workouts[1].id).toBe('workout-1')
    })

    it('does nothing if workout is not found', () => {
      const { moveWorkout } = useCalendarStore.getState()
      const before = useCalendarStore.getState().week
      moveWorkout('nonexistent', 1, 0, 0)
      const after = useCalendarStore.getState().week

      expect(after).toBe(before)
    })
  })

  describe('moveExercise', () => {
    it('moves an exercise between workouts', () => {
      const { moveExercise } = useCalendarStore.getState()
      moveExercise('ex-1', 'workout-1', 'workout-2', 0)

      const { week } = useCalendarStore.getState()
      const workout1 = week[1].workouts[0]
      const workout2 = week[2].workouts[0]

      expect(workout1.exercises).toHaveLength(1)
      expect(workout1.exercises[0].id).toBe('ex-2')
      expect(workout2.exercises).toHaveLength(2)
      expect(workout2.exercises[0].id).toBe('ex-1')
      expect(workout2.exercises[1].id).toBe('ex-3')
    })

    it('reorders exercises within the same workout', () => {
      const { moveExercise } = useCalendarStore.getState()
      moveExercise('ex-2', 'workout-1', 'workout-1', 0)

      const { week } = useCalendarStore.getState()
      const workout1 = week[1].workouts[0]

      expect(workout1.exercises).toHaveLength(2)
      expect(workout1.exercises[0].id).toBe('ex-2')
      expect(workout1.exercises[1].id).toBe('ex-1')
    })

    it('inserts exercise at specified position', () => {
      const { moveExercise } = useCalendarStore.getState()
      moveExercise('ex-1', 'workout-1', 'workout-2', 1)

      const { week } = useCalendarStore.getState()
      const workout2 = week[2].workouts[0]

      expect(workout2.exercises[0].id).toBe('ex-3')
      expect(workout2.exercises[1].id).toBe('ex-1')
    })

    it('does nothing if exercise is not found', () => {
      const { moveExercise } = useCalendarStore.getState()
      const before = useCalendarStore.getState().week
      moveExercise('nonexistent', 'workout-1', 'workout-2', 0)
      const after = useCalendarStore.getState().week

      expect(after).toBe(before)
    })
  })

  describe('addWorkout', () => {
    it('adds a new workout to the specified day', () => {
      const { addWorkout } = useCalendarStore.getState()
      addWorkout(0, { name: 'Push Day' })

      const { week } = useCalendarStore.getState()
      expect(week[0].workouts).toHaveLength(1)
      expect(week[0].workouts[0].name).toBe('Push Day')
      expect(week[0].workouts[0].exercises).toHaveLength(0)
    })

    it('assigns a unique id to the new workout', () => {
      const { addWorkout } = useCalendarStore.getState()
      addWorkout(0, { name: 'Push Day' })
      addWorkout(0, { name: 'Pull Day' })

      const { week } = useCalendarStore.getState()
      const ids = week[0].workouts.map((w) => w.id)
      expect(new Set(ids).size).toBe(2)
    })
  })

  describe('updateWorkout', () => {
    it('updates the workout name', () => {
      const { updateWorkout } = useCalendarStore.getState()
      updateWorkout('workout-1', { name: 'Updated Name' })

      const { week } = useCalendarStore.getState()
      expect(week[1].workouts[0].name).toBe('Updated Name')
    })

    it('does not affect other workouts', () => {
      const { updateWorkout } = useCalendarStore.getState()
      updateWorkout('workout-1', { name: 'Updated' })

      const { week } = useCalendarStore.getState()
      expect(week[2].workouts[0].name).toBe('Leg Day')
    })
  })

  describe('deleteWorkout', () => {
    it('removes the workout from its day', () => {
      const { deleteWorkout } = useCalendarStore.getState()
      deleteWorkout('workout-1')

      const { week } = useCalendarStore.getState()
      expect(week[1].workouts).toHaveLength(0)
    })

    it('does not affect other days', () => {
      const { deleteWorkout } = useCalendarStore.getState()
      deleteWorkout('workout-1')

      const { week } = useCalendarStore.getState()
      expect(week[2].workouts).toHaveLength(1)
    })
  })

  describe('addExercise', () => {
    it('adds a new exercise to the specified workout', () => {
      const { addExercise } = useCalendarStore.getState()
      addExercise('workout-1', { name: 'Incline Press', sets: 4, weightInfo: '60 lb x 8' })

      const { week } = useCalendarStore.getState()
      const exercises = week[1].workouts[0].exercises
      expect(exercises).toHaveLength(3)
      expect(exercises[2].name).toBe('Incline Press')
      expect(exercises[2].sets).toBe(4)
      expect(exercises[2].weightInfo).toBe('60 lb x 8')
    })
  })

  describe('updateExercise', () => {
    it('updates the exercise fields', () => {
      const { updateExercise } = useCalendarStore.getState()
      updateExercise('ex-1', { name: 'Flat Press', sets: 5, weightInfo: '70 lb x 5' })

      const { week } = useCalendarStore.getState()
      const ex = week[1].workouts[0].exercises[0]
      expect(ex.name).toBe('Flat Press')
      expect(ex.sets).toBe(5)
      expect(ex.weightInfo).toBe('70 lb x 5')
    })

    it('does not affect other exercises', () => {
      const { updateExercise } = useCalendarStore.getState()
      updateExercise('ex-1', { name: 'Updated', sets: 1, weightInfo: '' })

      const { week } = useCalendarStore.getState()
      expect(week[1].workouts[0].exercises[1].name).toBe('Fly')
    })
  })

  describe('deleteExercise', () => {
    it('removes the exercise from its workout', () => {
      const { deleteExercise } = useCalendarStore.getState()
      deleteExercise('ex-1')

      const { week } = useCalendarStore.getState()
      expect(week[1].workouts[0].exercises).toHaveLength(1)
      expect(week[1].workouts[0].exercises[0].id).toBe('ex-2')
    })

    it('does not affect exercises in other workouts', () => {
      const { deleteExercise } = useCalendarStore.getState()
      deleteExercise('ex-1')

      const { week } = useCalendarStore.getState()
      expect(week[2].workouts[0].exercises).toHaveLength(1)
    })
  })
})
