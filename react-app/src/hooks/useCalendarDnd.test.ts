import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { useCalendarDnd } from './useCalendarDnd'
import { CalendarProvider } from '@/stores/calendar-store'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'

vi.mock('@dnd-kit/core', () => ({
  PointerSensor: class {},
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn((...sensors: unknown[]) => sensors),
}))

const defaultWeek = [
  { date: 5, dayOfWeek: 'MON', isToday: false, workouts: [] },
  {
    date: 6,
    dayOfWeek: 'TUE',
    isToday: false,
    workouts: [
      {
        id: 'wo-1',
        name: 'Chest Day',
        exercises: [
          { id: 'ex-1', name: 'Bench Press', sets: 3, weightInfo: '50 lb x 5' },
          { id: 'ex-2', name: 'Fly', sets: 2, weightInfo: '30 lb x 10' },
        ],
      },
    ],
  },
  {
    date: 7,
    dayOfWeek: 'WED',
    isToday: false,
    workouts: [
      {
        id: 'wo-2',
        name: 'Leg Day',
        exercises: [
          { id: 'ex-3', name: 'Squat', sets: 4, weightInfo: '100 lb x 5' },
        ],
      },
    ],
  },
]

type Week = typeof defaultWeek

function createWrapper(initialWeek: Week = defaultWeek) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return CalendarProvider({ children, initialWeek })
  }
}

function makeDragStartEvent(id: string, type: string): DragStartEvent {
  return {
    active: {
      id,
      data: { current: { type } },
      rect: { current: { initial: null, translated: null } },
    },
  } as unknown as DragStartEvent
}

function makeDragEndEvent(
  activeId: string,
  activeType: string,
  overId: string,
  overType: string
): DragEndEvent {
  return {
    active: {
      id: activeId,
      data: { current: { type: activeType } },
      rect: { current: { initial: null, translated: null } },
    },
    over: {
      id: overId,
      data: { current: { type: overType } },
      rect: { current: null },
      disabled: false,
    },
    delta: { x: 0, y: 0 },
  } as unknown as DragEndEvent
}

function makeDragOverEvent(
  activeId: string,
  activeType: string,
  overId: string | null,
  overType?: string
): DragOverEvent {
  return {
    active: {
      id: activeId,
      data: { current: { type: activeType } },
      rect: { current: { initial: null, translated: null } },
    },
    over: overId
      ? {
          id: overId,
          data: { current: { type: overType } },
          rect: { current: null },
          disabled: false,
        }
      : null,
    delta: { x: 0, y: 0 },
  } as unknown as DragOverEvent
}

describe('useCalendarDnd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('exposes week from the store', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.week).toEqual(defaultWeek)
    })

    it('starts with all drag state null', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.activeId).toBeNull()
      expect(result.current.activeType).toBeNull()
      expect(result.current.overDayId).toBeNull()
      expect(result.current.overWorkoutId).toBeNull()
    })
  })

  describe('finder helpers', () => {
    it('findWorkoutById returns the correct workout', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.findWorkoutById('wo-1')?.name).toBe('Chest Day')
    })

    it('findWorkoutById returns undefined for unknown id', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.findWorkoutById('unknown')).toBeUndefined()
    })

    it('findWorkoutByExerciseId returns the workout containing the exercise', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.findWorkoutByExerciseId('ex-1')?.id).toBe('wo-1')
      expect(result.current.findWorkoutByExerciseId('ex-3')?.id).toBe('wo-2')
    })

    it('findWorkoutByExerciseId returns undefined for unknown exercise', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      expect(result.current.findWorkoutByExerciseId('unknown')).toBeUndefined()
    })
  })

  describe('handleDragStart', () => {
    it('sets activeId and activeType for a workout', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('wo-1', 'workout'))
      })
      expect(result.current.activeId).toBe('wo-1')
      expect(result.current.activeType).toBe('workout')
    })

    it('sets activeId and activeType for an exercise', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('ex-1', 'exercise'))
      })
      expect(result.current.activeId).toBe('ex-1')
      expect(result.current.activeType).toBe('exercise')
    })

    it('sets activeType to null when type is missing', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart({
          active: {
            id: 'x',
            data: { current: {} },
            rect: { current: { initial: null, translated: null } },
          },
        } as unknown as DragStartEvent)
      })
      expect(result.current.activeType).toBeNull()
    })
  })

  describe('handleDragOver', () => {
    it('clears overDayId and overWorkoutId when over is null', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('wo-1', 'workout'))
        result.current.handleDragOver(makeDragOverEvent('wo-1', 'workout', null))
      })
      expect(result.current.overDayId).toBeNull()
      expect(result.current.overWorkoutId).toBeNull()
    })

    it('sets overDayId when a workout is dragged over a day', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('wo-1', 'workout'))
        result.current.handleDragOver(makeDragOverEvent('wo-1', 'workout', 'MON', 'day'))
      })
      expect(result.current.overDayId).toBe('MON')
      expect(result.current.overWorkoutId).toBeNull()
    })

    it('sets overWorkoutId when an exercise is dragged over a workout', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('ex-1', 'exercise'))
        result.current.handleDragOver(makeDragOverEvent('ex-1', 'exercise', 'wo-2', 'workout'))
      })
      expect(result.current.overWorkoutId).toBe('wo-2')
      expect(result.current.overDayId).toBeNull()
    })

    it('sets overDayId from workout when a workout is dragged over another workout', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('wo-1', 'workout'))
        result.current.handleDragOver(makeDragOverEvent('wo-1', 'workout', 'wo-2', 'workout'))
      })
      expect(result.current.overDayId).toBe('WED')
    })
  })

  describe('handleDragEnd', () => {
    it('resets all drag state', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragStart(makeDragStartEvent('wo-1', 'workout'))
      })
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent('wo-1', 'workout', 'wo-2', 'workout'))
      })
      expect(result.current.activeId).toBeNull()
      expect(result.current.activeType).toBeNull()
      expect(result.current.overDayId).toBeNull()
      expect(result.current.overWorkoutId).toBeNull()
    })

    it('does nothing when active and over are the same id', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      const before = result.current.week
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent('wo-1', 'workout', 'wo-1', 'workout'))
      })
      expect(result.current.week).toBe(before)
    })

    it('finalizes same-workout exercise reorder', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent('ex-1', 'exercise', 'ex-2', 'exercise'))
      })
      const workout = result.current.week[1].workouts[0]
      expect(workout.exercises[0].id).toBe('ex-2')
      expect(workout.exercises[1].id).toBe('ex-1')
    })

    it('does not reorder when dropped on itself (same index)', () => {
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper() })
      const before = result.current.week
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent('ex-1', 'exercise', 'ex-1', 'exercise'))
      })
      expect(result.current.week).toBe(before)
    })

    it('finalizes same-day workout reorder', () => {
      const customWeek = [
        {
          date: 5,
          dayOfWeek: 'MON',
          isToday: false,
          workouts: [
            { id: 'wo-a', name: 'A', exercises: [] },
            { id: 'wo-b', name: 'B', exercises: [] },
          ],
        },
      ]
      const { result } = renderHook(() => useCalendarDnd(), { wrapper: createWrapper(customWeek) })
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent('wo-a', 'workout', 'wo-b', 'workout'))
      })
      const day = result.current.week[0]
      expect(day.workouts[0].id).toBe('wo-b')
      expect(day.workouts[1].id).toBe('wo-a')
    })
  })
})
