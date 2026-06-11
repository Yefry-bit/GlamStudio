import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { vi } from 'vitest'
import HistorialPage from '../Pages/HistorialPage'
import { encargadosService } from '../Services/encargadosService'

vi.mock('../Services/encargadosService')
vi.mock('bootstrap', () => ({
  Modal: class { show(){} hide(){} static getInstance(){ return null } }
}))
global.fetch = vi.fn()
global.alert = vi.fn()

const mockCitas = [{ idCita: 1, personalEncargado: 'Carlos', fechaHora: '2026-06-10T10:00:00', servicio: { nombre: 'Corte' } }]
const mockServicios = [{ idServicio: 1, nombre: 'Corte', precio: 20000 }]

const setupFetch = (citas = mockCitas) => {
  global.fetch.mockImplementation((url, opts) => {
    if (url.includes('Servicios')) return Promise.resolve({ ok: true, json: async () => mockServicios })
    if (opts?.method === 'DELETE') return Promise.resolve({ ok: true, json: async () => ({}) })
    if (opts?.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({}) })
    return Promise.resolve({ ok: true, json: async () => citas })
  })
}

describe('HistorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    encargadosService.getAll.mockResolvedValue([{ idUsuario: 1, nombre: 'Carlos', rol: 'Barbero' }])
    localStorage.setItem('token', 'test-token')
    setupFetch()
  })

  it('renderiza el titulo', async () => {
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    expect(screen.getByText(/Historial de Citas/)).toBeInTheDocument()
  })

  it('muestra citas cargadas', async () => {
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => {
      const tabla = screen.getByRole('table')
      expect(within(tabla).getByText('Carlos')).toBeInTheDocument()
    })
  })

  it('muestra mensaje sin citas', async () => {
    setupFetch([])
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => expect(screen.getByText(/No hay citas registradas/)).toBeInTheDocument())
  })

  it('elimina cita al confirmar', async () => {
    global.confirm = vi.fn(() => true)
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByText(/Eliminar/))
    await act(async () => { fireEvent.click(screen.getAllByText(/Eliminar/)[0]) })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('no elimina si el usuario cancela', async () => {
    global.confirm = vi.fn(() => false)
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByText(/Eliminar/))
    await act(async () => { fireEvent.click(screen.getAllByText(/Eliminar/)[0]) })
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('abre el modal de edicion al hacer clic en Editar', async () => {
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByText(/Editar/))
    await act(async () => { fireEvent.click(screen.getAllByText(/Editar/)[0]) })
    expect(screen.getByText('Editar Cita')).toBeInTheDocument()
  })

  it('actualiza la cita al hacer clic en Guardar en el modal', async () => {
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByText(/Editar/))
    await act(async () => { fireEvent.click(screen.getAllByText(/Editar/)[0]) })
    await act(async () => { fireEvent.click(screen.getByText('Guardar')) })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('cierra el modal al hacer clic en Cancelar', async () => {
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByText(/Editar/))
    await act(async () => { fireEvent.click(screen.getAllByText(/Editar/)[0]) })
    await act(async () => { fireEvent.click(screen.getByText('Cancelar')) })
    expect(screen.getByText('Editar Cita')).toBeInTheDocument()
  })

  it('maneja error al cargar citas', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('Servicios')) return Promise.resolve({ ok: true, json: async () => mockServicios })
      return Promise.reject(new Error('network error'))
    })
    await act(async () => { render(<MemoryRouter><HistorialPage /></MemoryRouter>) })
    expect(screen.getByText(/Historial de Citas/)).toBeInTheDocument()
  })
})