/**
 * Drag-and-drop item type identifiers used across the training calendar.
 * Kept as `as const` so TypeScript infers the narrow literal types,
 * which remain compatible with the WorkoutDragData / ExerciseDragData union.
 */
export const DND_TYPES = {
  WORKOUT: 'workout',
  EXERCISE: 'exercise',
  DAY: 'day',
} as const

export type DndType = (typeof DND_TYPES)[keyof typeof DND_TYPES]

/** Opacity applied to the element being dragged (ghost effect). */
export const DRAGGING_OPACITY = 0.4

/** Minimum pointer movement (px) before a drag gesture activates. */
export const DRAG_ACTIVATION_DISTANCE_PX = 5
