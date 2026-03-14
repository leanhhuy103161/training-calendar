import { useState, useCallback } from 'react'
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useCalendarStore } from '@/stores/calendar-store'
import type { CalendarDay, Workout } from '@/types'
import { DND_TYPES, DRAG_ACTIVATION_DISTANCE_PX } from '@/data/constant'

export type ActiveType = 'workout' | 'exercise'

export interface CalendarDndReturn {
  readonly week: CalendarDay[]
  readonly activeId: string | null
  readonly activeType: ActiveType | null
  readonly overDayId: string | null
  readonly overWorkoutId: string | null
  readonly sensors: ReturnType<typeof useSensors>
  readonly handleDragStart: (event: DragStartEvent) => void
  readonly handleDragOver: (event: DragOverEvent) => void
  readonly handleDragEnd: (event: DragEndEvent) => void
  readonly findWorkoutById: (id: string) => Workout | undefined
  readonly findWorkoutByExerciseId: (id: string) => Workout | undefined
}

export function useCalendarDnd(): CalendarDndReturn {
  const { week, moveWorkout, moveExercise } = useCalendarStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<ActiveType | null>(null)
  const [overDayId, setOverDayId] = useState<string | null>(null)
  const [overWorkoutId, setOverWorkoutId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } })
  )

  // ── Finder helpers ─────────────────────────────────────────

  const findDayIndexByWorkoutId = useCallback(
    (workoutId: string): number =>
      week.findIndex((d) => d.workouts.some((w) => w.id === workoutId)),
    [week]
  )

  const findWorkoutById = useCallback(
    (workoutId: string): Workout | undefined => {
      for (const day of week) {
        const found = day.workouts.find((w) => w.id === workoutId)
        if (found) return found
      }
      return undefined
    },
    [week]
  )

  const findWorkoutByExerciseId = useCallback(
    (exerciseId: string): Workout | undefined => {
      for (const day of week) {
        for (const w of day.workouts) {
          if (w.exercises.some((e) => e.id === exerciseId)) return w
        }
      }
      return undefined
    },
    [week]
  )

  // ── Drag start ─────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    const type = event.active.data.current?.type as ActiveType | undefined
    setActiveId(event.active.id as string)
    setActiveType(type ?? null)
  }, [])

  // ── Drag over (live preview) ────────────────────────────────

  const handleDragOver = useCallback(
    (event: DragOverEvent): void => {
      const { active, over } = event

      if (!over) {
        setOverDayId(null)
        setOverWorkoutId(null)
        return
      }

      const activeData = active.data.current
      const overData = over.data.current
      if (!activeData || !overData) return

      // Determine which day / workout the pointer is over
      let hoveredDayId: string | null = null
      let hoveredWorkoutId: string | null = null

      if (overData.type === DND_TYPES.DAY) {
        hoveredDayId = over.id as string
      } else if (overData.type === DND_TYPES.WORKOUT) {
        hoveredWorkoutId = over.id as string
        const dayIdx = findDayIndexByWorkoutId(over.id as string)
        if (dayIdx !== -1) hoveredDayId = week[dayIdx].dayOfWeek
      } else if (overData.type === DND_TYPES.EXERCISE) {
        const workout = findWorkoutByExerciseId(over.id as string)
        if (workout) {
          hoveredWorkoutId = workout.id
          const dayIdx = findDayIndexByWorkoutId(workout.id)
          if (dayIdx !== -1) hoveredDayId = week[dayIdx].dayOfWeek
        }
      }

      if (activeData.type === DND_TYPES.WORKOUT) {
        setOverDayId(hoveredDayId)
        setOverWorkoutId(null)
      } else if (activeData.type === DND_TYPES.EXERCISE) {
        setOverDayId(null)
        setOverWorkoutId(hoveredWorkoutId)
      }

      // Exercise dragged over another exercise / workout → live cross-workout move
      if (activeData.type === DND_TYPES.EXERCISE) {
        const activeWorkout = findWorkoutByExerciseId(active.id as string)
        if (!activeWorkout) return

        let toWorkoutId: string | null = null
        let toPosition = 0

        if (overData.type === DND_TYPES.EXERCISE) {
          const overWorkout = findWorkoutByExerciseId(over.id as string)
          if (overWorkout) {
            toWorkoutId = overWorkout.id
            toPosition = overWorkout.exercises.findIndex((e) => e.id === over.id)
          }
        } else if (overData.type === DND_TYPES.WORKOUT) {
          toWorkoutId = over.id as string
          const overWorkout = findWorkoutById(toWorkoutId)
          toPosition = overWorkout?.exercises.length ?? 0
        }

        if (toWorkoutId && activeWorkout.id !== toWorkoutId) {
          moveExercise(active.id as string, activeWorkout.id, toWorkoutId, toPosition)
        }
      }

      // Workout dragged over a day / other workout → live cross-day or same-day reorder
      if (activeData.type === DND_TYPES.WORKOUT) {
        const fromDayIndex = findDayIndexByWorkoutId(active.id as string)
        if (fromDayIndex === -1) return

        let toDayIndex = -1
        let toWorkoutId: string | null = null

        if (overData.type === DND_TYPES.DAY) {
          toDayIndex = week.findIndex((d) => d.dayOfWeek === (over.id as string))
        } else if (overData.type === DND_TYPES.WORKOUT) {
          toDayIndex = findDayIndexByWorkoutId(over.id as string)
          toWorkoutId = over.id as string
        } else if (overData.type === DND_TYPES.EXERCISE) {
          const overWorkout = findWorkoutByExerciseId(over.id as string)
          if (overWorkout) {
            toDayIndex = findDayIndexByWorkoutId(overWorkout.id)
            toWorkoutId = overWorkout.id
          }
        }

        if (toDayIndex === -1) return

        const toDay = week[toDayIndex]
        let toPosition: number

        if (toWorkoutId) {
          const idx = toDay.workouts.findIndex((w) => w.id === toWorkoutId)
          toPosition = idx === -1 ? toDay.workouts.length : idx
        } else {
          toPosition = toDay.workouts.length
        }

        if (fromDayIndex !== toDayIndex) {
          moveWorkout(active.id as string, fromDayIndex, toDayIndex, toPosition)
        } else if (toWorkoutId && active.id !== toWorkoutId) {
          const currentIndex = toDay.workouts.findIndex((w) => w.id === active.id)
          if (currentIndex !== toPosition) {
            moveWorkout(active.id as string, fromDayIndex, fromDayIndex, toPosition)
          }
        }
      }
    },
    [week, findDayIndexByWorkoutId, findWorkoutById, findWorkoutByExerciseId, moveWorkout, moveExercise]
  )

  // ── Drag end (finalize same-container reorders) ────────────

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event

      setActiveId(null)
      setActiveType(null)
      setOverDayId(null)
      setOverWorkoutId(null)

      if (!over || active.id === over.id) return

      const activeData = active.data.current
      const overData = over.data.current
      if (!activeData || !overData) return

      if (activeData.type === DND_TYPES.EXERCISE && overData.type === DND_TYPES.EXERCISE) {
        const activeWorkout = findWorkoutByExerciseId(active.id as string)
        const overWorkout = findWorkoutByExerciseId(over.id as string)

        if (activeWorkout && overWorkout && activeWorkout.id === overWorkout.id) {
          const fromIdx = activeWorkout.exercises.findIndex((e) => e.id === active.id)
          const toIdx = activeWorkout.exercises.findIndex((e) => e.id === over.id)
          if (fromIdx !== toIdx) {
            moveExercise(active.id as string, activeWorkout.id, activeWorkout.id, toIdx)
          }
        }
      }

      if (activeData.type === DND_TYPES.WORKOUT && overData.type === DND_TYPES.WORKOUT) {
        const activeDayIdx = findDayIndexByWorkoutId(active.id as string)
        const overDayIdx = findDayIndexByWorkoutId(over.id as string)

        if (activeDayIdx !== -1 && activeDayIdx === overDayIdx) {
          const day = week[activeDayIdx]
          const fromIdx = day.workouts.findIndex((w) => w.id === active.id)
          const toIdx = day.workouts.findIndex((w) => w.id === over.id)
          if (fromIdx !== toIdx) {
            moveWorkout(active.id as string, activeDayIdx, activeDayIdx, toIdx)
          }
        }
      }
    },
    [week, findDayIndexByWorkoutId, findWorkoutByExerciseId, moveWorkout, moveExercise]
  )

  return {
    week,
    activeId,
    activeType,
    overDayId,
    overWorkoutId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    findWorkoutById,
    findWorkoutByExerciseId,
  }
}
