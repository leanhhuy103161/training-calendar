import { useState, useEffect, useRef } from 'react'
import type { JSX, ChangeEvent, SubmitEvent } from 'react'
import type { Workout } from '@/types'
import { useCalendarStore } from '@/stores/calendar-store'
import { cn } from '@/utils'
import { t } from '@/data/translations'
import Modal from '@/components/modal'

interface AddProps {
  readonly mode: 'add'
  readonly dayIndex: number
  readonly onClose: () => void
}

interface EditProps {
  readonly mode: 'edit'
  readonly workout: Workout
  readonly onClose: () => void
}

type Props = AddProps | EditProps

export default function WorkoutFormModal(props: Props): JSX.Element {
  const { onClose } = props
  const [name, setName] = useState(props.mode === 'edit' ? props.workout.name : '')
  const [nameError, setNameError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { addWorkout, updateWorkout, deleteWorkout } = useCalendarStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
    if (nameError) setNameError('')
  }

  const handleSubmit = (e: SubmitEvent): void => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(t.workoutForm.nameRequired)
      return
    }
    if (props.mode === 'add') {
      addWorkout(props.dayIndex, { name: trimmed })
    } else {
      updateWorkout(props.workout.id, { name: trimmed })
    }
    onClose()
  }

  const handleDelete = (): void => {
    if (props.mode !== 'edit') return
    deleteWorkout(props.workout.id)
    onClose()
  }

  const title = props.mode === 'add' ? t.workoutForm.addTitle : t.workoutForm.editTitle

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1 mb-4">
          <label
            htmlFor="workout-name"
            className="text-[10px] font-semibold text-day-header uppercase"
          >
            {t.workoutForm.nameLabel}
          </label>
          <input
            id="workout-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleNameChange}
            className={cn(
              'text-input text-exercise-name border rounded-card px-2 py-1.5 outline-none transition-colors',
              nameError
                ? 'border-red-400 focus:border-red-500'
                : 'border-card-border focus:border-workout-title'
            )}
            placeholder={t.workoutForm.namePlaceholder}
            aria-required="true"
            aria-describedby={nameError ? 'workout-name-error' : undefined}
          />
          {nameError && (
            <span id="workout-name-error" className="text-[10px] text-red-500" role="alert">
              {nameError}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {props.mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-[0.6875rem] font-semibold text-red-500 px-3 py-1.5 rounded-card border border-red-200 bg-transparent cursor-pointer hover:bg-red-50 transition-colors"
            >
              {t.actions.delete}
            </button>
          )}
          <div className={cn('flex gap-2', props.mode === 'add' && 'ml-auto')}>
            <button
              type="button"
              onClick={onClose}
              className="text-[0.6875rem] font-semibold text-day-header px-3 py-1.5 rounded-card border border-card-border bg-transparent cursor-pointer hover:bg-day-bg transition-colors"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="text-[0.6875rem] font-semibold text-white px-3 py-1.5 rounded-card border-none bg-workout-title cursor-pointer hover:opacity-90 transition-opacity"
            >
              {props.mode === 'add' ? t.actions.add : t.actions.save}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
