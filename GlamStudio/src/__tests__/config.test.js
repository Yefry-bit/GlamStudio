import { describe, it, expect, vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ defaults: { baseURL: 'http://localhost:5078/api' } }))
  }
}))

import api from '../API/config'

describe('config API', () => {
  it('tiene la baseURL correcta', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5078/api')
  })
})