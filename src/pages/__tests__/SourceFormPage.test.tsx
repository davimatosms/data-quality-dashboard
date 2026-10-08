import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SourceFormPage } from '../SourceFormPage'
import * as sourcesApi from '../../api/sources'

vi.mock('../../api/sources', () => ({
  createSource: vi.fn(),
  listSources: vi.fn(),
  updateSource: vi.fn(),
}))

describe('SourceFormPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a source with normalized rules', async () => {
    vi.mocked(sourcesApi.createSource).mockResolvedValue({
      id: 7,
      name: 'Empresas',
      description: null,
      expected_frequency_minutes: 60,
      freshness_tolerance: 1.5,
      quality_rules: ['cnpj'],
      freshness: 'UNKNOWN',
      quality: 'UNKNOWN',
    })

    render(
      <MemoryRouter initialEntries={['/sources/new']}>
        <Routes><Route path="/sources/new" element={<SourceFormPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Empresas' } })
    fireEvent.change(screen.getByLabelText('Frequência esperada (minutos)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Regras esperadas'), { target: { value: ' cnpj \n\n cep ' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Salvar fonte' }).closest('form')!)

    await waitFor(() => expect(sourcesApi.createSource).toHaveBeenCalledWith({
      name: 'Empresas',
      description: '',
      expected_frequency_minutes: 60,
      freshness_tolerance: 1.5,
      quality_rules: ['cnpj', 'cep'],
    }))
  })
})
