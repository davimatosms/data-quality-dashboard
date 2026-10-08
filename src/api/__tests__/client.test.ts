import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request } from '../client'

describe('request', () => {
  afterEach(() => vi.restoreAllMocks())

  it('parses successful JSON responses and sends an accept header', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    await expect(request<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health', expect.objectContaining({
      headers: expect.objectContaining({ Accept: 'application/json' }),
    }))
  })

  it('returns API detail for non-success responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Fonte não encontrada.' }), { status: 404 }),
    )

    await expect(request('/sources/999')).rejects.toEqual(
      expect.objectContaining<ApiError>({ name: 'ApiError', status: 404, message: 'Fonte não encontrada.' }),
    )
  })

  it('converts network failures into an explicit API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'))

    await expect(request('/health')).rejects.toEqual(
      expect.objectContaining<ApiError>({ name: 'ApiError', status: 0, message: 'Não foi possível conectar à API.' }),
    )
  })
})
