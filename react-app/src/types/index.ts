export interface Exercise {
  id: string
  name: string
  sets: number
  weightInfo: string
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
}

export interface CalendarDay {
  date: number
  dayOfWeek: string
  workouts: Workout[]
  isToday: boolean
}

export type WeekData = CalendarDay[]

export interface WorkoutDragData {
  type: 'workout'
  workout: Workout
  sourceDayIndex: number
}

export interface ExerciseDragData {
  type: 'exercise'
  exercise: Exercise
  sourceWorkoutId: string
}

export type DragData = WorkoutDragData | ExerciseDragData

export interface WorkoutFormData {
  name: string
}

export interface ExerciseFormData {
  name: string
  sets: number
  weightInfo: string
}
