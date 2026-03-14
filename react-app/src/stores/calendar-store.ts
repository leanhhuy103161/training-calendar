import { create } from 'zustand'
import type { CalendarDay, Exercise, Workout, WorkoutFormData, ExerciseFormData } from '@/types'
import { mockWeek } from '@/data/mock-week'

export interface CalendarStore {
  week: CalendarDay[]
  moveWorkout: (
    workoutId: string,
    fromDayIndex: number,
    toDayIndex: number,
    toPosition: number
  ) => void
  moveExercise: (
    exerciseId: string,
    fromWorkoutId: string,
    toWorkoutId: string,
    toPosition: number
  ) => void
  addWorkout: (dayIndex: number, data: WorkoutFormData) => void
  updateWorkout: (workoutId: string, data: WorkoutFormData) => void
  deleteWorkout: (workoutId: string) => void
  addExercise: (workoutId: string, data: ExerciseFormData) => void
  updateExercise: (exerciseId: string, data: ExerciseFormData) => void
  deleteExercise: (exerciseId: string) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  week: mockWeek,

  moveWorkout: (workoutId, fromDayIndex, toDayIndex, toPosition): void => {
    set((state) => {
      const week = state.week.map((day) => ({
        ...day,
        workouts: [...day.workouts],
      }))

      const fromDay = week[fromDayIndex]
      const workoutIndex = fromDay.workouts.findIndex((w) => w.id === workoutId)
      if (workoutIndex === -1) return state

      const [workout] = fromDay.workouts.splice(workoutIndex, 1)
      const toDay = week[toDayIndex]
      toDay.workouts.splice(toPosition, 0, workout)

      return { week }
    })
  },

  moveExercise: (exerciseId, fromWorkoutId, toWorkoutId, toPosition): void => {
    set((state) => {
      const week = state.week.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({
          ...w,
          exercises: [...w.exercises],
        })),
      }))

      let removedExercise = null

      for (const day of week) {
        for (const workout of day.workouts) {
          if (workout.id === fromWorkoutId) {
            const idx = workout.exercises.findIndex((e) => e.id === exerciseId)
            if (idx !== -1) {
              removedExercise = workout.exercises.splice(idx, 1)[0]
            }
          }
        }
      }

      if (!removedExercise) return state

      for (const day of week) {
        for (const workout of day.workouts) {
          if (workout.id === toWorkoutId) {
            workout.exercises.splice(toPosition, 0, removedExercise)
          }
        }
      }

      return { week }
    })
  },

  addWorkout: (dayIndex, data): void => {
    set((state) => {
      const week = state.week.map((day) => ({ ...day, workouts: [...day.workouts] }))
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        name: data.name,
        exercises: [],
      }
      week[dayIndex].workouts.push(newWorkout)
      return { week }
    })
  },

  updateWorkout: (workoutId, data): void => {
    set((state) => ({
      week: state.week.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) =>
          w.id === workoutId ? { ...w, name: data.name } : w
        ),
      })),
    }))
  },

  deleteWorkout: (workoutId): void => {
    set((state) => ({
      week: state.week.map((day) => ({
        ...day,
        workouts: day.workouts.filter((w) => w.id !== workoutId),
      })),
    }))
  },

  addExercise: (workoutId, data): void => {
    set((state) => ({
      week: state.week.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => {
          if (w.id !== workoutId) return w
          const newExercise: Exercise = {
            id: crypto.randomUUID(),
            name: data.name,
            sets: data.sets,
            weightInfo: data.weightInfo,
          }
          return { ...w, exercises: [...w.exercises, newExercise] }
        }),
      })),
    }))
  },

  updateExercise: (exerciseId, data): void => {
    set((state) => ({
      week: state.week.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({
          ...w,
          exercises: w.exercises.map((e) =>
            e.id === exerciseId ? { ...e, ...data } : e
          ),
        })),
      })),
    }))
  },

  deleteExercise: (exerciseId): void => {
    set((state) => ({
      week: state.week.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({
          ...w,
          exercises: w.exercises.filter((e) => e.id !== exerciseId),
        })),
      })),
    }))
  },
}))
