import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type JSX,
  type ReactNode,
} from 'react'
import type { CalendarDay, Exercise, Workout, WorkoutFormData, ExerciseFormData } from '@/types'
import { mockWeek } from '@/data/mock-week'

// ── Action types ─────────────────────────────────────────────────────────────

type CalendarAction =
  | {
      type: 'MOVE_WORKOUT'
      workoutId: string
      fromDayIndex: number
      toDayIndex: number
      toPosition: number
    }
  | {
      type: 'MOVE_EXERCISE'
      exerciseId: string
      fromWorkoutId: string
      toWorkoutId: string
      toPosition: number
    }
  | { type: 'ADD_WORKOUT'; dayIndex: number; data: WorkoutFormData }
  | { type: 'UPDATE_WORKOUT'; workoutId: string; data: WorkoutFormData }
  | { type: 'DELETE_WORKOUT'; workoutId: string }
  | { type: 'ADD_EXERCISE'; workoutId: string; data: ExerciseFormData }
  | { type: 'UPDATE_EXERCISE'; exerciseId: string; data: ExerciseFormData }
  | { type: 'DELETE_EXERCISE'; exerciseId: string }

// ── Reducer ───────────────────────────────────────────────────────────────────

export function calendarReducer(state: CalendarDay[], action: CalendarAction): CalendarDay[] {
  switch (action.type) {
    case 'MOVE_WORKOUT': {
      const { workoutId, fromDayIndex, toDayIndex, toPosition } = action
      const week = state.map((day) => ({ ...day, workouts: [...day.workouts] }))
      const fromDay = week[fromDayIndex]
      const workoutIndex = fromDay.workouts.findIndex((w) => w.id === workoutId)
      if (workoutIndex === -1) return state
      const [workout] = fromDay.workouts.splice(workoutIndex, 1)
      week[toDayIndex].workouts.splice(toPosition, 0, workout)
      return week
    }

    case 'MOVE_EXERCISE': {
      const { exerciseId, fromWorkoutId, toWorkoutId, toPosition } = action
      const week = state.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({ ...w, exercises: [...w.exercises] })),
      }))
      let removedExercise: Exercise | null = null
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
      return week
    }

    case 'ADD_WORKOUT': {
      const { dayIndex, data } = action
      const week = state.map((day) => ({ ...day, workouts: [...day.workouts] }))
      const newWorkout: Workout = { id: crypto.randomUUID(), name: data.name, exercises: [] }
      week[dayIndex].workouts.push(newWorkout)
      return week
    }

    case 'UPDATE_WORKOUT': {
      const { workoutId, data } = action
      return state.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => (w.id === workoutId ? { ...w, name: data.name } : w)),
      }))
    }

    case 'DELETE_WORKOUT': {
      return state.map((day) => ({
        ...day,
        workouts: day.workouts.filter((w) => w.id !== action.workoutId),
      }))
    }

    case 'ADD_EXERCISE': {
      const { workoutId, data } = action
      return state.map((day) => ({
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
      }))
    }

    case 'UPDATE_EXERCISE': {
      const { exerciseId, data } = action
      return state.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({
          ...w,
          exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, ...data } : e)),
        })),
      }))
    }

    case 'DELETE_EXERCISE': {
      return state.map((day) => ({
        ...day,
        workouts: day.workouts.map((w) => ({
          ...w,
          exercises: w.exercises.filter((e) => e.id !== action.exerciseId),
        })),
      }))
    }
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

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

const CalendarContext = createContext<CalendarStore | null>(null)

interface CalendarProviderProps {
  readonly children: ReactNode
  readonly initialWeek?: CalendarDay[]
}

export function CalendarProvider({ children, initialWeek }: CalendarProviderProps): JSX.Element {
  const [week, dispatch] = useReducer(calendarReducer, initialWeek ?? mockWeek)

  const moveWorkout = useCallback(
    (workoutId: string, fromDayIndex: number, toDayIndex: number, toPosition: number): void => {
      dispatch({ type: 'MOVE_WORKOUT', workoutId, fromDayIndex, toDayIndex, toPosition })
    },
    []
  )

  const moveExercise = useCallback(
    (
      exerciseId: string,
      fromWorkoutId: string,
      toWorkoutId: string,
      toPosition: number
    ): void => {
      dispatch({ type: 'MOVE_EXERCISE', exerciseId, fromWorkoutId, toWorkoutId, toPosition })
    },
    []
  )

  const addWorkout = useCallback((dayIndex: number, data: WorkoutFormData): void => {
    dispatch({ type: 'ADD_WORKOUT', dayIndex, data })
  }, [])

  const updateWorkout = useCallback((workoutId: string, data: WorkoutFormData): void => {
    dispatch({ type: 'UPDATE_WORKOUT', workoutId, data })
  }, [])

  const deleteWorkout = useCallback((workoutId: string): void => {
    dispatch({ type: 'DELETE_WORKOUT', workoutId })
  }, [])

  const addExercise = useCallback((workoutId: string, data: ExerciseFormData): void => {
    dispatch({ type: 'ADD_EXERCISE', workoutId, data })
  }, [])

  const updateExercise = useCallback((exerciseId: string, data: ExerciseFormData): void => {
    dispatch({ type: 'UPDATE_EXERCISE', exerciseId, data })
  }, [])

  const deleteExercise = useCallback((exerciseId: string): void => {
    dispatch({ type: 'DELETE_EXERCISE', exerciseId })
  }, [])

  const value: CalendarStore = {
    week,
    moveWorkout,
    moveExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendarStore(): CalendarStore {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendarStore must be used within a CalendarProvider')
  return ctx
}
