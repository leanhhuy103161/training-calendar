import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkoutFormModal from './WorkoutFormModal'
import { useCalendarStore } from '@/stores/calendar-store'
import type { Workout } from '@/types'

const workout: Workout = {
  id: 'wo-1',
  name: 'Chest Day',
  exercises: [],
}

beforeEach(() => {
  useCalendarStore.setState({
    week: [{ date: 5, dayOfWeek: 'MON', workouts: [workout], isToday: false }],
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

describe('WorkoutFormModal — add mode', () => {
  it('renders the Add Workout title', () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Add Workout' })).toBeInTheDocument()
  })

  it('renders an empty name input', () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/workout name/i)).toHaveValue('')
  })

  it('renders Add submit button', () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('does not render Delete button', () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('shows validation error when submitting empty name', async () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Workout name is required')
  })

  it('calls addWorkout and onClose on valid submit', async () => {
    const onClose = vi.fn()
    render(<WorkoutFormModal mode="add" dayIndex={2} onClose={onClose} />)
    await userEvent.type(screen.getByLabelText(/workout name/i), 'Push Day')
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(useCalendarStore.getState().addWorkout).toHaveBeenCalledWith(2, { name: 'Push Day' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('clears validation error when user starts typing', async () => {
    render(<WorkoutFormModal mode="add" dayIndex={0} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/workout name/i), 'A')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('WorkoutFormModal — edit mode', () => {
  it('renders the Edit Workout title', () => {
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Edit Workout' })).toBeInTheDocument()
  })

  it('pre-fills the name input with the workout name', () => {
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/workout name/i)).toHaveValue('Chest Day')
  })

  it('renders Save submit button', () => {
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls updateWorkout and onClose on valid submit', async () => {
    const onClose = vi.fn()
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={onClose} />)
    const input = screen.getByLabelText(/workout name/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Back Day')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(useCalendarStore.getState().updateWorkout).toHaveBeenCalledWith('wo-1', {
      name: 'Back Day',
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls deleteWorkout and onClose when Delete is clicked', () => {
    const onClose = vi.fn()
    render(<WorkoutFormModal mode="edit" workout={workout} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(useCalendarStore.getState().deleteWorkout).toHaveBeenCalledWith('wo-1')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
