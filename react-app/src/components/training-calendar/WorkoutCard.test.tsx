import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WorkoutCard from './WorkoutCard'
import type { Workout } from '@/types'
import { useCalendarStore } from '@/stores/calendar-store'

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

vi.mock('@/stores/calendar-store', () => ({
  useCalendarStore: vi.fn(),
}))

const workout: Workout = {
  id: 'wo-1',
  name: 'Chest Day',
  exercises: [
    { id: 'ex-1', name: 'Bench Press', sets: 3, weightInfo: '50 lb x 5' },
    { id: 'ex-2', name: 'Fly', sets: 2, weightInfo: '30 lb x 10' },
  ],
}

beforeEach(() => {
  vi.mocked(useCalendarStore).mockReturnValue({
    week: [],
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

describe('WorkoutCard', () => {
  it('renders the workout name', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    expect(screen.getByText('Chest Day')).toBeInTheDocument()
  })

  it('renders all exercises', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Fly')).toBeInTheDocument()
  })

  it('has correct aria-label for workout group', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    expect(screen.getByRole('group', { name: 'Workout: Chest Day' })).toBeInTheDocument()
  })

  it('renders add exercise button', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    expect(screen.getByRole('button', { name: 'Add exercise' })).toBeInTheDocument()
  })

  it('renders workout options button', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    expect(screen.getByRole('button', { name: 'Workout options' })).toBeInTheDocument()
  })

  it('opens edit workout modal when options button is clicked', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    fireEvent.click(screen.getByRole('button', { name: 'Workout options' }))
    expect(screen.getByRole('dialog', { name: 'Edit Workout' })).toBeInTheDocument()
  })

  it('opens add exercise modal when add exercise button is clicked', () => {
    render(<WorkoutCard workout={workout} dayId="MON" />)
    fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))
    expect(screen.getByRole('dialog', { name: 'Add Exercise' })).toBeInTheDocument()
  })

  it('applies highlighted border when isOver is true', () => {
    render(<WorkoutCard workout={workout} dayId="MON" isOver={true} />)
    const group = screen.getByRole('group')
    expect(group).toHaveClass('border-workout-title')
    expect(group).toHaveClass('bg-drag-workout')
  })

  it('applies default border when isOver is false', () => {
    render(<WorkoutCard workout={workout} dayId="MON" isOver={false} />)
    const group = screen.getByRole('group')
    expect(group).toHaveClass('border-card-border')
  })

  it('renders with empty exercises list', () => {
    const empty: Workout = { ...workout, exercises: [] }
    render(<WorkoutCard workout={empty} dayId="MON" />)
    expect(screen.getByRole('group', { name: 'Workout: Chest Day' })).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})
