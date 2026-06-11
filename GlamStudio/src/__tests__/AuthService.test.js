import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../Services/AuthService'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn()
  })

  it('login exitoso guarda token', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'abc123' }),
    })
    const data = await authService.login('admin', '1234')
    expect(localStorage.getItem('token')).toBe('abc123')
    expect(data.token).toBe('abc123')
  })

  it('login fallido lanza error', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: false })
    await expect(authService.login('admin', 'mal')).rejects.toThrow()
  })

  it('logout elimina token', () => {
    localStorage.setItem('token', 'abc123')
    authService.logout()
    expect(localStorage.getItem('token')).toBeNull()
  })
})