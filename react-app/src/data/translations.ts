export const t = {
  calendar: {
    regionLabel: 'Training calendar',
  },

  dayColumn: {
    addWorkoutTo: (dayOfWeek: string): string => `Add workout to ${dayOfWeek}`,
  },

  workoutCard: {
    groupLabel: (name: string): string => `Workout: ${name}`,
    options: 'Workout options',
    addExercise: 'Add exercise',
  },

  exerciseCard: {
    itemLabel: (name: string): string => `Exercise: ${name}`,
    editLabel: (name: string): string => `Edit ${name}`,
  },

  modal: {
    closeDialog: 'Close dialog',
  },

  workoutForm: {
    addTitle: 'Add Workout',
    editTitle: 'Edit Workout',
    nameLabel: 'Workout Name',
    namePlaceholder: 'e.g. Chest Day',
    nameRequired: 'Workout name is required',
  },

  exerciseForm: {
    addTitle: 'Add Exercise',
    editTitle: 'Edit Exercise',
    nameLabel: 'Exercise Name',
    namePlaceholder: 'e.g. Bench Press',
    nameRequired: 'Exercise name is required',
    setsLabel: 'Sets',
    setsPlaceholder: '3',
    setsRequired: 'Sets must be a positive number',
    weightInfoLabel: 'Weight Info',
    weightInfoPlaceholder: 'e.g. 50 lb x 5',
  },

  actions: {
    delete: 'Delete',
    cancel: 'Cancel',
    add: 'Add',
    save: 'Save',
  },
} as const
