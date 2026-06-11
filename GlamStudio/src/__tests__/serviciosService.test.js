import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serviciosService } from '../Services/serviciosService'

describe('serviciosService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    globalThis.fetch = vi.fn()
  })

  it('getAll retorna lista', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ idServicio: 1, nombre: 'Corte' }],
    })
    const data = await serviciosService.getAll()
    expect(data).toHaveLength(1)
  })

  it('getAll lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(serviciosService.getAll()).rejects.toThrow()
  })

  it('create envía POST y retorna data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idServicio: 3, nombre: 'Manicure' }),
    })
    const data = await serviciosService.create({ nombre: 'Manicure', precio: 30000 })
    expect(data.nombre).toBe('Manicure')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('create lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(serviciosService.create({})).rejects.toThrow()
  })

  it('update envía PUT y retorna data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idServicio: 1, nombre: 'Corte Actualizado' }),
    })
    const data = await serviciosService.update(1, { nombre: 'Corte Actualizado' })
    expect(data.nombre).toBe('Corte Actualizado')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('update lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(serviciosService.update(1, {})).rejects.toThrow()
  })

  it('remove envía DELETE', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: true })
    await serviciosService.remove(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('remove lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(serviciosService.remove(1)).rejects.toThrow()
  })
})