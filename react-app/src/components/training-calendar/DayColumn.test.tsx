import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DayColumn from './DayColumn'
import type { CalendarDay } from '@/types'
import { useCalendarStore } from '@/stores/calendar-store'

vi.mock('@dnd-kit/core', () => ({
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

const day: CalendarDay = {
  date: 5,
  dayOfWeek: 'MON',
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
}

beforeEach(() => {
  useCalendarStore.setState({
    week: [day],
    moveWorkout: vi.fn(),
    moveExercise: vi.fn(),
    addWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
    addExercise: vi.fn(),
    updateExercise: vi.fn(),
    deleteExercise: vi.fn(),
  })
})

describe('DayColumn', () => {
  it('renders the day label', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByText('MON')).toBeInTheDocument()
  })

  it('renders the date number', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders workouts for the day', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByText('Chest Day')).toBeInTheDocument()
  })

  it('renders exercises inside workouts', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('renders add workout button', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByRole('button', { name: 'Add workout to MON' })).toBeInTheDocument()
  })

  it('opens the add workout modal when add button is clicked', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add workout to MON' }))
    expect(screen.getByRole('dialog', { name: 'Add Workout' })).toBeInTheDocument()
  })

  it('closes the add workout modal when onClose is called', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add workout to MON' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('applies highlight when overDayId matches', () => {
    const { container } = render(
      <DayColumn day={day} dayIndex={0} overDayId="MON" overWorkoutId={null} />
    )
    const dayContainer = container.querySelector('.border-workout-title')
    expect(dayContainer).toBeInTheDocument()
    expect(dayContainer).toHaveClass('bg-drag-day')
  })

  it('does not apply highlight when overDayId does not match', () => {
    const { container } = render(
      <DayColumn day={day} dayIndex={0} overDayId="TUE" overWorkoutId={null} />
    )
    expect(container.querySelector('.border-workout-title')).not.toBeInTheDocument()
  })

  it('applies today styling when isToday is true', () => {
    const today: CalendarDay = { ...day, isToday: true }
    render(<DayColumn day={today} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    const dateEl = screen.getByText('5')
    expect(dateEl).toHaveClass('text-workout-title')
    expect(dateEl).toHaveClass('font-bold')
  })

  it('applies default date styling when isToday is false', () => {
    render(<DayColumn day={day} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    const dateEl = screen.getByText('5')
    expect(dateEl).toHaveClass('text-date-number')
    expect(dateEl).not.toHaveClass('font-bold')
  })

  it('renders with no workouts', () => {
    const empty: CalendarDay = { ...day, workouts: [] }
    render(<DayColumn day={empty} dayIndex={0} overDayId={null} overWorkoutId={null} />)
    expect(screen.getByText('MON')).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })
})
