import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExerciseCard from './ExerciseCard'
import type { Exercise } from '@/types'
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
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

vi.mock('@/stores/calendar-store', () => ({
  useCalendarStore: vi.fn(),
}))

const exercise: Exercise = {
  id: 'ex-1',
  name: 'Bench Press Med...',
  sets: 3,
  weightInfo: '50 lb x 5, 60 lb x 5',
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

describe('ExerciseCard', () => {
  it('renders the exercise name', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByText('Bench Press Med...')).toBeInTheDocument()
  })

  it('renders the set count with x suffix', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByText('3x')).toBeInTheDocument()
  })

  it('renders the weight info', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByText('50 lb x 5, 60 lb x 5')).toBeInTheDocument()
  })

  it('has the correct aria-label', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(
      screen.getByRole('listitem', { name: 'Exercise: Bench Press Med...' })
    ).toBeInTheDocument()
  })

  it('applies grab cursor class', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByRole('listitem')).toHaveClass('cursor-grab')
  })

  it('applies shadow-card class', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByRole('listitem')).toHaveClass('shadow-card')
  })

  it('renders with sets = 1', () => {
    const single: Exercise = { ...exercise, sets: 1 }
    render(<ExerciseCard exercise={single} workoutId="wo-1" />)
    expect(screen.getByText('1x')).toBeInTheDocument()
  })

  it('renders an edit button', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    expect(screen.getByRole('button', { name: 'Edit Bench Press Med...' })).toBeInTheDocument()
  })

  it('opens edit exercise modal when edit button is clicked', () => {
    render(<ExerciseCard exercise={exercise} workoutId="wo-1" />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit Bench Press Med...' }))
    expect(screen.getByRole('dialog', { name: 'Edit Exercise' })).toBeInTheDocument()
  })
})
