import { describe, it, expect, vi, beforeEach } from 'vitest'
import { citasService } from '../Services/citasService'

describe('citasService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    globalThis.fetch = vi.fn()
  })

  it('getAll retorna lista de citas', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ idCita: 1, personalEncargado: 'Carlos' }],
    })
    const data = await citasService.getAll()
    expect(data).toHaveLength(1)
  })

  it('create envía POST y retorna data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idCita: 2 }),
    })
    const data = await citasService.create({ personalEncargado: 'Carlos' })
    expect(data.idCita).toBe(2)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('create lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(citasService.create({})).rejects.toThrow()
  })
})