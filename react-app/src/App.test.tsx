import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { useCalendarStore } from '@/stores/calendar-store'
import { mockWeek } from '@/data/mock-week'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  pointerWithin: {},
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

describe('App', () => {
  beforeEach(() => {
    useCalendarStore.setState({ week: mockWeek })
  })

  it('renders the training calendar region', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: 'Training calendar' })).toBeInTheDocument()
  })

  it('renders all 7 day columns', () => {
    render(<App />)
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    for (const day of days) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })
})
