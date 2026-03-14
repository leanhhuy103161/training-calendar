import { type JSX } from 'react'
import { DndContext, pointerWithin, DragOverlay } from '@dnd-kit/core'
import { useCalendarDnd } from '@/hooks/useCalendarDnd'
import { t } from '@/data/translations'
import DayColumn from './DayColumn'
import WorkoutCard from './WorkoutCard'
import ExerciseCard from './ExerciseCard'

export default function TrainingCalendar(): JSX.Element {
  const {
    week,
    activeId,
    activeType,
    overDayId,
    overWorkoutId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    findWorkoutById,
    findWorkoutByExerciseId,
  } = useCalendarDnd()

  const activeWorkout =
    activeType === 'workout' && activeId ? (findWorkoutById(activeId) ?? null) : null

  const activeExercise =
    activeType === 'exercise' && activeId
      ? (findWorkoutByExerciseId(activeId)?.exercises.find((e) => e.id === activeId) ?? null)
      : null

  return (
    <div
      className="w-360 h-225 bg-white p-15 flex gap-2.5 font-sans mx-auto"
      role="region"
      aria-label={t.calendar.regionLabel}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {week.map((day, index) => (
          <DayColumn
            key={day.dayOfWeek}
            day={day}
            dayIndex={index}
            overDayId={overDayId}
            overWorkoutId={overWorkoutId}
          />
        ))}

        <DragOverlay dropAnimation={null}>
          {activeWorkout && (
            <div className="opacity-90 shadow-lg">
              <WorkoutCard workout={activeWorkout} dayId="" />
            </div>
          )}
          {activeExercise && (
            <div className="opacity-90 shadow-lg w-39.75">
              <ExerciseCard exercise={activeExercise} workoutId="" />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
