import type { WeekData } from '@/types'

export const mockWeek: WeekData = [
  {
    date: 5,
    dayOfWeek: 'MON',
    workouts: [],
    isToday: false,
  },
  {
    date: 6,
    dayOfWeek: 'TUE',
    workouts: [
      {
        id: 'workout-chest',
        name: 'Chest day - with arm...',
        exercises: [
          {
            id: 'exercise-bench-press',
            name: 'Bench Press Med...',
            sets: 3,
            weightInfo: '50 lb x 5, 60 lb x 5, 70 l...',
          },
          {
            id: 'exercise-b',
            name: 'Exercise B',
            sets: 1,
            weightInfo: '40 lb x 10',
          },
        ],
      },
    ],
    isToday: false,
  },
  {
    date: 7,
    dayOfWeek: 'WED',
    workouts: [
      {
        id: 'workout-leg',
        name: 'Leg DaY',
        exercises: [
          {
            id: 'exercise-c',
            name: 'Exercise C',
            sets: 1,
            weightInfo: '30 lb x 6',
          },
          {
            id: 'exercise-d',
            name: 'Exercise D',
            sets: 1,
            weightInfo: '40 lb x 5',
          },
          {
            id: 'exercise-e',
            name: 'Exercise E',
            sets: 1,
            weightInfo: '50 lb x 5',
          },
        ],
      },
      {
        id: 'workout-arm',
        name: 'Arm day',
        exercises: [
          {
            id: 'exercise-f',
            name: 'Exercise F',
            sets: 1,
            weightInfo: '60 lb x 6',
          },
        ],
      },
    ],
    isToday: false,
  },
  {
    date: 8,
    dayOfWeek: 'THU',
    workouts: [],
    isToday: false,
  },
  {
    date: 9,
    dayOfWeek: 'FRI',
    workouts: [],
    isToday: true,
  },
  {
    date: 10,
    dayOfWeek: 'SAT',
    workouts: [],
    isToday: false,
  },
  {
    date: 11,
    dayOfWeek: 'SUN',
    workouts: [],
    isToday: false,
  },
]
