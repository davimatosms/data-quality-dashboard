import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders freshness status with an accessible label', () => {
    render(<StatusBadge kind="freshness" value="FRESH" />)

    expect(screen.getByText('FRESH')).toHaveAttribute('aria-label', 'Freshness: FRESH')
  })

  it('renders quality status without relying on color alone', () => {
    render(<StatusBadge kind="quality" value="FAILING" />)

    expect(screen.getByText('FAILING')).toHaveAttribute('aria-label', 'Qualidade: FAILING')
  })
})
