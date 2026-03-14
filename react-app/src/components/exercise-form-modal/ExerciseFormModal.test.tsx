import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseFormModal from './ExerciseFormModal'
import { useCalendarStore } from '@/stores/calendar-store'
import type { Exercise } from '@/types'

const exercise: Exercise = {
  id: 'ex-1',
  name: 'Bench Press',
  sets: 3,
  weightInfo: '50 lb x 5',
}

beforeEach(() => {
  useCalendarStore.setState({
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

describe('ExerciseFormModal — add mode', () => {
  it('renders the Add Exercise title', () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Add Exercise' })).toBeInTheDocument()
  })

  it('renders empty inputs', () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    expect(screen.getByLabelText(/exercise name/i)).toHaveValue('')
    expect(screen.getByLabelText(/^sets$/i)).toHaveValue(null)
    expect(screen.getByLabelText(/weight info/i)).toHaveValue('')
  })

  it('renders Add submit button', () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('does not render Delete button', () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('shows name validation error on empty submit', async () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.some((a) => a.textContent?.includes('Exercise name is required'))).toBe(true)
  })

  it('shows sets validation error on empty submit', async () => {
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.some((a) => a.textContent?.includes('Sets must be a positive number'))).toBe(true)
  })

  it('calls addExercise and onClose on valid submit', async () => {
    const onClose = vi.fn()
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={onClose} />)
    await userEvent.type(screen.getByLabelText(/exercise name/i), 'Squat')
    await userEvent.type(screen.getByLabelText(/^sets$/i), '4')
    await userEvent.type(screen.getByLabelText(/weight info/i), '80 lb x 5')
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(useCalendarStore.getState().addExercise).toHaveBeenCalledWith('wo-1', {
      name: 'Squat',
      sets: 4,
      weightInfo: '80 lb x 5',
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<ExerciseFormModal mode="add" workoutId="wo-1" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('ExerciseFormModal — edit mode', () => {
  it('renders the Edit Exercise title', () => {
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Edit Exercise' })).toBeInTheDocument()
  })

  it('pre-fills all fields with exercise data', () => {
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/exercise name/i)).toHaveValue('Bench Press')
    expect(screen.getByLabelText(/^sets$/i)).toHaveValue(3)
    expect(screen.getByLabelText(/weight info/i)).toHaveValue('50 lb x 5')
  })

  it('renders Save submit button', () => {
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls updateExercise and onClose on valid submit', async () => {
    const onClose = vi.fn()
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={onClose} />)
    const nameInput = screen.getByLabelText(/exercise name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Incline Press')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(useCalendarStore.getState().updateExercise).toHaveBeenCalledWith('ex-1', {
      name: 'Incline Press',
      sets: 3,
      weightInfo: '50 lb x 5',
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls deleteExercise and onClose when Delete is clicked', () => {
    const onClose = vi.fn()
    render(<ExerciseFormModal mode="edit" exercise={exercise} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(useCalendarStore.getState().deleteExercise).toHaveBeenCalledWith('ex-1')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
