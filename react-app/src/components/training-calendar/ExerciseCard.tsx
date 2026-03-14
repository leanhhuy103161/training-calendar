import type { JSX } from 'react'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Exercise } from '@/types'
import { DND_TYPES, DRAGGING_OPACITY } from '@/data/constant'
import { t } from '@/data/translations'
import ExerciseFormModal from '@/components/exercise-form-modal'

interface Props {
  readonly exercise: Exercise
  readonly workoutId: string
}

export default function ExerciseCard({ exercise, workoutId: _workoutId }: Props): JSX.Element {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
    data: {
      type: DND_TYPES.EXERCISE,
      exercise,
      sourceWorkoutId: _workoutId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAGGING_OPACITY : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative flex items-start gap-1 rounded-card bg-white border border-card-border px-1.5 py-1.5 cursor-grab active:cursor-grabbing shadow-card"
        role="listitem"
        aria-label={t.exerciseCard.itemLabel(exercise.name)}
      >
        <span className="text-[10px] font-bold leading-3.5 text-exercise-sets font-sans min-w-3.5 mt-auto">
          {exercise.sets}x
        </span>

        <div className="flex flex-col items-end flex-1 min-w-0">
          <span className="text-[0.8125rem] font-semibold leading-4.5 text-exercise-name font-sans truncate w-full text-right">
            {exercise.name}
          </span>
          <span className="text-[10px] font-normal leading-3.5 text-exercise-sets font-sans truncate w-full text-right">
            {exercise.weightInfo}
          </span>
        </div>

        {/* Edit button — visible on hover */}
        <button
          className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 border-none bg-white/80 cursor-pointer text-day-header hover:text-workout-title transition-opacity p-0"
          aria-label={t.exerciseCard.editLabel(exercise.name)}
          onClick={(e) => {
            e.stopPropagation()
            setIsEditOpen(true)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1 6.5H2L5.5 3L5 2.5L1 6V6.5Z" fill="currentColor" />
            <path d="M5.5 1L7 2.5L6 3.5L4.5 2L5.5 1Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {isEditOpen && (
        <ExerciseFormModal
          mode="edit"
          exercise={exercise}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}
