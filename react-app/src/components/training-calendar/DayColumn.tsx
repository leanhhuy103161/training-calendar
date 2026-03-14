import type { JSX } from 'react'
import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { CalendarDay } from '@/types'
import { cn } from '@/utils'
import { DND_TYPES } from '@/data/constant'
import { t } from '@/data/translations'
import WorkoutCard from './WorkoutCard'
import WorkoutFormModal from '@/components/workout-form-modal'

interface Props {
  readonly day: CalendarDay
  readonly dayIndex: number
  readonly overDayId: string | null
  readonly overWorkoutId: string | null
}

export default function DayColumn({ day, dayIndex, overDayId, overWorkoutId }: Props): JSX.Element {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)

  const { setNodeRef } = useDroppable({
    id: day.dayOfWeek,
    data: {
      type: DND_TYPES.DAY,
      day,
    },
  })

  const isDayHighlighted = overDayId === day.dayOfWeek

  return (
    <div className="flex flex-col gap-2.25 w-44.75 shrink-0 font-sans">
      {/* Day label */}
      <span className="text-[10px] font-semibold leading-3.5 text-day-header uppercase">
        {day.dayOfWeek}
      </span>

      {/* Day container */}
      <div
        ref={setNodeRef}
        className={cn(
          'bg-day-bg rounded-day flex-1 min-h-189.25 p-1.75 flex flex-col transition-all duration-200 border-2',
          isDayHighlighted ? 'border-workout-title bg-drag-day' : 'border-transparent'
        )}
      >
        {/* Date + add button header */}
        <div className="flex items-center justify-between mb-2.5 px-0.75">
          <span
            className={cn(
              'text-[0.6875rem] leading-3.75',
              day.isToday ? 'font-bold text-workout-title' : 'font-semibold text-date-number'
            )}
          >
            {day.date}
          </span>

          <button
            className="w-3 h-3 rounded-full bg-add-button flex items-center justify-center border-none cursor-pointer p-0 hover:bg-add-button-hover transition-colors"
            aria-label={t.dayColumn.addWorkoutTo(day.dayOfWeek)}
            onClick={() => setIsAddWorkoutOpen(true)}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
              <rect x="2" y="0" width="2" height="6" rx="0.5" fill="white" />
              <rect x="0" y="2" width="6" height="2" rx="0.5" fill="white" />
            </svg>
          </button>
        </div>

        {/* Workouts — sortable zone */}
        <SortableContext
          items={day.workouts.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.25 flex-1">
            {day.workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                dayId={day.dayOfWeek}
                isOver={overWorkoutId === workout.id}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {isAddWorkoutOpen && (
        <WorkoutFormModal
          mode="add"
          dayIndex={dayIndex}
          onClose={() => setIsAddWorkoutOpen(false)}
        />
      )}
    </div>
  )
}
