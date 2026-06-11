import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from '../Pages/Login'
import { authService } from '../Services/AuthService'

vi.mock('../Services/AuthService', () => ({
  authService: { login: vi.fn() }
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.alert = vi.fn()
  })

  it('renderiza el formulario de login', async () => {
    await act(async () => { render(<MemoryRouter><LoginPage /></MemoryRouter>) })
    expect(screen.getByText('Bienvenido')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Escribe tu usuario')).toBeInTheDocument()
  })

  it('permite escribir usuario y contraseña', async () => {
    await act(async () => { render(<MemoryRouter><LoginPage /></MemoryRouter>) })
    const usuarioInput = screen.getByPlaceholderText('Escribe tu usuario')
    fireEvent.change(usuarioInput, { target: { value: 'admin' } })
    expect(usuarioInput.value).toBe('admin')
  })

  it('llama a authService.login al enviar el formulario', async () => {
    authService.login.mockResolvedValueOnce({})
    await act(async () => { render(<MemoryRouter><LoginPage /></MemoryRouter>) })

    const form = screen.getByText('Ingresar').closest('form')
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Escribe tu usuario'), { target: { value: 'admin' } })
      // ✅ fix: submit directo al form, no click al botón
      fireEvent.submit(form)
    })
    await waitFor(() => expect(authService.login).toHaveBeenCalled())
  })

  it('muestra alerta si el login falla', async () => {
    authService.login.mockRejectedValueOnce(new Error('Error'))
    await act(async () => { render(<MemoryRouter><LoginPage /></MemoryRouter>) })

    const form = screen.getByText('Ingresar').closest('form')
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Escribe tu usuario'), { target: { value: 'admin' } })
      fireEvent.submit(form)
    })
    await waitFor(
      () => expect(globalThis.alert).toHaveBeenCalledWith('Usuario o contraseña incorrectos'),
      { timeout: 3000 }
    )
  })
})