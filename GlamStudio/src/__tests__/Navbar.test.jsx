import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import Navbar from '../Pages/Navbar'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn(), useLocation: vi.fn() }
})

describe('Navbar', () => {
  it('no renderiza nada en la ruta /', () => {
    useNavigate.mockReturnValue(vi.fn())
    useLocation.mockReturnValue({ pathname: '/' })
    const { container } = render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(container.firstChild).toBeNull()
  })
  it('renderiza la navbar fuera de /', () => {
    useNavigate.mockReturnValue(vi.fn())
    useLocation.mockReturnValue({ pathname: '/principal' })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText(/GLAM/)).toBeInTheDocument()
  })
  it('no muestra boton Inicio en /principal', () => {
    useNavigate.mockReturnValue(vi.fn())
    useLocation.mockReturnValue({ pathname: '/principal' })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.queryByText(/Inicio/)).not.toBeInTheDocument()
  })
  it('muestra boton Inicio en otras rutas', () => {
    useNavigate.mockReturnValue(vi.fn())
    useLocation.mockReturnValue({ pathname: '/citas' })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText(/Inicio/)).toBeInTheDocument()
  })
  it('llama navigate a / al cerrar sesion', () => {
    const mockNavigate = vi.fn()
    useNavigate.mockReturnValue(mockNavigate)
    useLocation.mockReturnValue({ pathname: '/principal' })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    fireEvent.click(screen.getByText(/Cerrar sesi/))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})