import type { JSX } from 'react'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Workout } from '@/types'
import { cn } from '@/utils'
import { DND_TYPES, DRAGGING_OPACITY } from '@/data/constant'
import { t } from '@/data/translations'
import ExerciseCard from './ExerciseCard'
import WorkoutFormModal from '@/components/workout-form-modal'
import ExerciseFormModal from '@/components/exercise-form-modal'

interface Props {
  readonly workout: Workout
  readonly dayId: string
  readonly isOver?: boolean
}

export default function WorkoutCard({ workout, dayId, isOver = false }: Props): JSX.Element {
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false)
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workout.id,
    data: {
      type: DND_TYPES.WORKOUT,
      workout,
      dayId,
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
        className={cn(
          'bg-white rounded-day border-2 flex flex-col font-sans transition-all duration-200',
          isOver ? 'border-workout-title bg-drag-workout' : 'border-card-border'
        )}
        role="group"
        aria-label={t.workoutCard.groupLabel(workout.name)}
      >
        {/* Header: workout name + drag handle + menu dots */}
        <div
          className="flex items-start justify-between px-1.75 pt-1.25 pb-0.75 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <span
            className="text-[10px] font-bold leading-3.5 text-workout-title truncate max-w-32.5 uppercase"
            title={workout.name}
          >
            {workout.name}
          </span>

          <button
            className="flex items-center gap-px p-0 border-none bg-transparent cursor-pointer mt-0.5"
            aria-label={t.workoutCard.options}
            onClick={(e) => {
              e.stopPropagation()
              setIsEditWorkoutOpen(true)
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="w-0.75 h-0.75 rounded-full bg-menu-dots" />
            <span className="w-0.75 h-0.75 rounded-full bg-menu-dots" />
            <span className="w-0.75 h-0.75 rounded-full bg-menu-dots" />
          </button>
        </div>

        {/* Exercises list */}
        <div className="flex flex-col gap-1 px-0.75 pb-0.75">
          <SortableContext
            items={workout.exercises.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {workout.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} workoutId={workout.id} />
            ))}
          </SortableContext>
        </div>

        {/* Add exercise button */}
        <div className="flex justify-end px-1.75 pb-1.25 pt-0.5">
          <button
            className="w-3 h-3 rounded-full bg-add-button flex items-center justify-center border-none cursor-pointer p-0 hover:bg-add-button-hover transition-colors"
            aria-label={t.workoutCard.addExercise}
            onClick={(e) => {
              e.stopPropagation()
              setIsAddExerciseOpen(true)
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
              <rect x="2" y="0" width="2" height="6" rx="0.5" fill="white" />
              <rect x="0" y="2" width="6" height="2" rx="0.5" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      {isEditWorkoutOpen && (
        <WorkoutFormModal
          mode="edit"
          workout={workout}
          onClose={() => setIsEditWorkoutOpen(false)}
        />
      )}

      {isAddExerciseOpen && (
        <ExerciseFormModal
          mode="add"
          workoutId={workout.id}
          onClose={() => setIsAddExerciseOpen(false)}
        />
      )}
    </>
  )
}
