import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encargadosService } from '../Services/encargadosService'

describe('encargadosService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    globalThis.fetch = vi.fn()
  })

  it('getAll retorna lista', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ idUsuario: 1, nombre: 'Carlos' }],
    })
    const data = await encargadosService.getAll()
    expect(data).toHaveLength(1)
  })

  it('getAll lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(encargadosService.getAll()).rejects.toThrow()
  })

  it('create envía POST y retorna data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idUsuario: 3, nombre: 'Pedro' }),
    })
    const data = await encargadosService.create({ nombre: 'Pedro' })
    expect(data.nombre).toBe('Pedro')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('create lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(encargadosService.create({})).rejects.toThrow()
  })

  it('update envía PUT y retorna data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idUsuario: 1, nombre: 'Carlos Actualizado' }),
    })
    const data = await encargadosService.update(1, { nombre: 'Carlos Actualizado' })
    expect(data.nombre).toBe('Carlos Actualizado')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('update lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(encargadosService.update(1, {})).rejects.toThrow()
  })

  it('remove envía DELETE', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: true })
    await encargadosService.remove(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('remove lanza error si falla', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(encargadosService.remove(1)).rejects.toThrow()
  })
})