import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { vi } from 'vitest'
import CitasPage from '../Pages/CitasPage'
import { serviciosService } from '../Services/serviciosService'
import { encargadosService } from '../Services/encargadosService'

vi.mock('../Services/serviciosService')
vi.mock('../Services/encargadosService')
global.fetch = vi.fn()
global.alert = vi.fn()

const mockServicios = [{ idServicio: 1, nombre: 'Corte', precio: 20000 }]
const mockEncargados = [{ idUsuario: 1, nombre: 'Carlos', rol: 'Barbero' }]

describe('CitasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviciosService.getAll.mockResolvedValue(mockServicios)
    encargadosService.getAll.mockResolvedValue(mockEncargados)
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] })
    localStorage.setItem('token', 'test-token')
  })

  it('renderiza el titulo', async () => {
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    expect(screen.getByText(/Gesti/)).toBeInTheDocument()
  })

  it('renderiza boton Reservar Turno', async () => {
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    expect(screen.getByText(/Reservar Turno/)).toBeInTheDocument()
  })

  it('carga encargados en el select', async () => {
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(within(selects[0]).getByText('Carlos')).toBeInTheDocument()
    })
  })

  it('alerta si no hay encargado al guardar', async () => {
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Reservar Turno/ }).closest('form'))
    })
    expect(global.alert).toHaveBeenCalledWith('Seleccione un encargado')
  })

  it('alerta si no hay servicio seleccionado', async () => {
    serviciosService.getAll.mockResolvedValue([])
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(within(selects[0]).getByText('Carlos')).toBeInTheDocument()
    })
    await act(async () => {
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Carlos' } })
    })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Reservar Turno/ }).closest('form'))
    })
    expect(global.alert).toHaveBeenCalledWith('Seleccione un servicio')
  })

  it('guarda la cita correctamente con token', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
      .mockResolvedValue({ ok: true, json: async () => [] })
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByRole('combobox'))
    await act(async () => {
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Carlos' } })
      fireEvent.change(selects[1], { target: { value: '1' } })
    })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Reservar Turno/ }).closest('form'))
    })
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('Citas'),
      expect.objectContaining({ method: 'POST' })
    ))
  })

  it('alerta cuando no hay token al guardar', async () => {
    localStorage.removeItem('token')
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await waitFor(() => screen.getAllByRole('combobox'))
    await act(async () => {
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Carlos' } })
      fireEvent.change(selects[1], { target: { value: '1' } })
    })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Reservar Turno/ }).closest('form'))
    })
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('sesi'))
  })

  it('muestra seccion Citas Programadas', async () => {
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    expect(screen.getByText(/Citas Programadas/)).toBeInTheDocument()
  })

  it('muestra citas cargadas desde el backend', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        idCita: 1,
        personalEncargado: 'Carlos',
        fechaHora: '2026-06-10T10:00:00',
        servicio: { nombre: 'Corte' }
      }]
    })
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    await waitFor(() => {
      const lista = document.querySelector('.lista-citas-contenedor')
      expect(within(lista).getByText('Carlos')).toBeInTheDocument()
    })
  })

  it('maneja error de fetch al cargar citas', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network error'))
    await act(async () => { render(<MemoryRouter><CitasPage /></MemoryRouter>) })
    expect(screen.getByText(/Citas Programadas/)).toBeInTheDocument()
  })
})