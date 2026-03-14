import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
  it('renders the title', () => {
    render(
      <Modal title="Test Modal" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Modal title="Modal" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>
    )
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('has dialog role with aria-label matching title', () => {
    render(
      <Modal title="Add Workout" onClose={vi.fn()}>
        <p>body</p>
      </Modal>
    )
    expect(screen.getByRole('dialog', { name: 'Add Workout' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Modal" onClose={onClose}>
        <p>body</p>
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal title="Modal" onClose={onClose}>
        <p>body</p>
      </Modal>
    )
    const backdrop = container.querySelector('[aria-hidden="true"]')
    expect(backdrop).toBeInTheDocument()
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Modal" onClose={onClose}>
        <p>body</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose for non-Escape keys', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Modal" onClose={onClose}>
        <p>body</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
