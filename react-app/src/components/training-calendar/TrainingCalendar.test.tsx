import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TrainingCalendar from './TrainingCalendar'
import type { CalendarDay } from '@/types'

const mockFindWorkoutById = vi.fn()
const mockFindWorkoutByExerciseId = vi.fn()

const mockWeek: CalendarDay[] = [
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
          { id: 'ex-2', name: 'Squat', sets: 4, weightInfo: '100 lb x 5' },
        ],
      },
    ],
  },
  { date: 8, dayOfWeek: 'THU', isToday: false, workouts: [] },
  { date: 9, dayOfWeek: 'FRI', isToday: true, workouts: [] },
  { date: 10, dayOfWeek: 'SAT', isToday: false, workouts: [] },
  { date: 11, dayOfWeek: 'SUN', isToday: false, workouts: [] },
]

vi.mock('@/hooks/useCalendarDnd', () => ({
  useCalendarDnd: vi.fn(() => ({
    week: mockWeek,
    activeId: null,
    activeType: null,
    overDayId: null,
    overWorkoutId: null,
    sensors: [],
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    findWorkoutById: mockFindWorkoutById,
    findWorkoutByExerciseId: mockFindWorkoutByExerciseId,
  })),
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  pointerWithin: {},
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

describe('TrainingCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the training calendar region', () => {
    render(<TrainingCalendar />)
    expect(screen.getByRole('region', { name: 'Training calendar' })).toBeInTheDocument()
  })

  it('renders all 7 day columns', () => {
    render(<TrainingCalendar />)
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    for (const day of days) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('renders workouts in the correct day column', () => {
    render(<TrainingCalendar />)
    expect(screen.getByText('Chest Day')).toBeInTheDocument()
    expect(screen.getByText('Leg Day')).toBeInTheDocument()
  })

  it('renders exercises inside workouts', () => {
    render(<TrainingCalendar />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('renders date numbers for all days', () => {
    render(<TrainingCalendar />)
    for (const day of mockWeek) {
      expect(screen.getByText(String(day.date))).toBeInTheDocument()
    }
  })

  it('shows add workout buttons for each day', () => {
    render(<TrainingCalendar />)
    const addButtons = screen.getAllByRole('button', { name: /Add workout to/i })
    expect(addButtons).toHaveLength(7)
  })
})
