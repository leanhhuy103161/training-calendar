import type { JSX } from 'react'
import TrainingCalendar from '@/components/training-calendar'
import { CalendarProvider } from '@/stores/calendar-store'

export default function App(): JSX.Element {
  return (
    <CalendarProvider>
      <TrainingCalendar />
    </CalendarProvider>
  )
}
