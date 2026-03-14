import type { JSX, FormEvent, ChangeEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import type { Exercise } from '@/types'
import { useCalendarStore } from '@/stores/calendar-store'
import { cn } from '@/utils'
import Modal from '@/components/modal'

interface AddProps {
  readonly mode: 'add'
  readonly workoutId: string
  readonly onClose: () => void
}

interface EditProps {
  readonly mode: 'edit'
  readonly exercise: Exercise
  readonly onClose: () => void
}

type Props = AddProps | EditProps

interface FormErrors {
  name?: string
  sets?: string
}

export default function ExerciseFormModal(props: Props): JSX.Element {
  const { onClose } = props
  const [name, setName] = useState(props.mode === 'edit' ? props.exercise.name : '')
  const [sets, setSets] = useState(
    props.mode === 'edit' ? String(props.exercise.sets) : ''
  )
  const [weightInfo, setWeightInfo] = useState(
    props.mode === 'edit' ? props.exercise.weightInfo : ''
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const { addExercise, updateExercise, deleteExercise } = useCalendarStore()

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'Exercise name is required'
    const setsNum = parseInt(sets, 10)
    if (!sets.trim() || isNaN(setsNum) || setsNum < 1) next.sets = 'Sets must be a positive number'
    return next
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    const data = { name: name.trim(), sets: parseInt(sets, 10), weightInfo: weightInfo.trim() }
    if (props.mode === 'add') {
      addExercise(props.workoutId, data)
    } else {
      updateExercise(props.exercise.id, data)
    }
    onClose()
  }

  const handleDelete = (): void => {
    if (props.mode !== 'edit') return
    deleteExercise(props.exercise.id)
    onClose()
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handleSetsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSets(e.target.value)
    if (errors.sets) setErrors((prev) => ({ ...prev, sets: undefined }))
  }

  const inputBase =
    'text-[12px] text-exercise-name border rounded-card px-2 py-1.5 outline-none transition-colors w-full'
  const inputValid = 'border-card-border focus:border-workout-title'
  const inputInvalid = 'border-red-400 focus:border-red-500'

  return (
    <Modal title={props.mode === 'add' ? 'Add Exercise' : 'Edit Exercise'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Name field */}
        <div className="flex flex-col gap-1 mb-3">
          <label
            htmlFor="exercise-name"
            className="text-[10px] font-semibold text-day-header uppercase"
          >
            Exercise Name
          </label>
          <input
            id="exercise-name"
            ref={nameRef}
            type="text"
            value={name}
            onChange={handleNameChange}
            className={cn(inputBase, errors.name ? inputInvalid : inputValid)}
            placeholder="e.g. Bench Press"
            aria-required="true"
            aria-describedby={errors.name ? 'exercise-name-error' : undefined}
          />
          {errors.name && (
            <span id="exercise-name-error" className="text-[10px] text-red-500" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* Sets + Weight row */}
        <div className="flex gap-2 mb-4">
          <div className="flex flex-col gap-1 w-20">
            <label
              htmlFor="exercise-sets"
              className="text-[10px] font-semibold text-day-header uppercase"
            >
              Sets
            </label>
            <input
              id="exercise-sets"
              type="number"
              min={1}
              value={sets}
              onChange={handleSetsChange}
              className={cn(inputBase, errors.sets ? inputInvalid : inputValid)}
              placeholder="3"
              aria-required="true"
              aria-describedby={errors.sets ? 'exercise-sets-error' : undefined}
            />
            {errors.sets && (
              <span id="exercise-sets-error" className="text-[10px] text-red-500" role="alert">
                {errors.sets}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="exercise-weight"
              className="text-[10px] font-semibold text-day-header uppercase"
            >
              Weight Info
            </label>
            <input
              id="exercise-weight"
              type="text"
              value={weightInfo}
              onChange={(e) => setWeightInfo(e.target.value)}
              className={cn(inputBase, inputValid)}
              placeholder="e.g. 50 lb x 5"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {props.mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] font-semibold text-red-500 px-3 py-1.5 rounded-card border border-red-200 bg-transparent cursor-pointer hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <div className={cn('flex gap-2', props.mode === 'add' && 'ml-auto')}>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-semibold text-day-header px-3 py-1.5 rounded-card border border-card-border bg-transparent cursor-pointer hover:bg-day-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-card border-none bg-workout-title cursor-pointer hover:opacity-90 transition-opacity"
            >
              {props.mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
