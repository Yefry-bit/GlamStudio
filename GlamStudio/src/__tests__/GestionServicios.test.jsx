import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import GestionServicios from '../Pages/GestionServicios'
import { serviciosService } from '../Services/serviciosService'

vi.mock('../Services/serviciosService', () => ({
  serviciosService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }
}))

const mockData = [
  { idServicio: 1, nombre: 'Corte', precio: 20000 },
  { idServicio: 2, nombre: 'Tinte', precio: 50000 },
]

describe('GestionServicios', () => {
  beforeEach(() => {
    serviciosService.getAll.mockResolvedValue(mockData)
    serviciosService.create.mockResolvedValue({})
    serviciosService.update.mockResolvedValue({})
    serviciosService.remove.mockResolvedValue({})
    globalThis.confirm = vi.fn(() => true)
  })

  it('renderiza el título', async () => {
    await act(async () => { render(<GestionServicios />) })
    expect(screen.getByText('Gestión de Servicios')).toBeInTheDocument()
  })

  it('muestra los servicios cargados', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => expect(screen.getByText('Corte')).toBeInTheDocument())
    expect(screen.getByText('Tinte')).toBeInTheDocument()
  })

  it('muestra el total de servicios en stats', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => {
      const totales = screen.getAllByText('2')
      expect(totales.length).toBeGreaterThan(0)
    })
  })

  it('abre el modal al hacer clic en Nuevo servicio', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => screen.getByText('+ Nuevo servicio'))
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo servicio')) })
    expect(screen.getByRole('heading', { name: 'Nuevo servicio' })).toBeInTheDocument()
  })

  it('cierra el modal al hacer clic en Cancelar', async () => {
    await act(async () => { render(<GestionServicios />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo servicio')) })
    await act(async () => { fireEvent.click(screen.getByText('Cancelar')) })
    expect(screen.queryByRole('heading', { name: 'Nuevo servicio' })).not.toBeInTheDocument()
  })

  it('muestra error si nombre o precio están vacíos', async () => {
    await act(async () => { render(<GestionServicios />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo servicio')) })
    await act(async () => { fireEvent.click(screen.getByText('Crear servicio')) })
    expect(screen.getByText('Nombre y precio son obligatorios.')).toBeInTheDocument()
  })

  it('crea un servicio correctamente', async () => {
    await act(async () => { render(<GestionServicios />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo servicio')) })
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Ej: Corte de cabello'), { target: { value: 'Manicure' } })
      fireEvent.change(screen.getByPlaceholderText('Ej: 50000'), { target: { value: '30000' } })
      fireEvent.click(screen.getByText('Crear servicio'))
    })
    await waitFor(() => expect(serviciosService.create).toHaveBeenCalled())
  })

  it('abre modal de edición al hacer clic en Editar', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => screen.getAllByText('✏️ Editar'))
    await act(async () => { fireEvent.click(screen.getAllByText('✏️ Editar')[0]) })
    expect(screen.getByRole('heading', { name: 'Editar servicio' })).toBeInTheDocument()
  })

  it('elimina un servicio al confirmar', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => screen.getAllByText('🗑️ Eliminar'))
    await act(async () => { fireEvent.click(screen.getAllByText('🗑️ Eliminar')[0]) })
    await waitFor(() => expect(serviciosService.remove).toHaveBeenCalledWith(1))
  })

  it('no elimina si el usuario cancela', async () => {
    globalThis.confirm = vi.fn(() => false)
    serviciosService.remove.mockClear()
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => screen.getAllByText('🗑️ Eliminar'))
    await act(async () => { fireEvent.click(screen.getAllByText('🗑️ Eliminar')[0]) })
    expect(serviciosService.remove).not.toHaveBeenCalled()
  })

  it('filtra servicios por búsqueda', async () => {
    await act(async () => { render(<GestionServicios />) })
    await waitFor(() => screen.getByText('Corte'))
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Buscar servicio por nombre...'), { target: { value: 'Tinte' } })
    })
    expect(screen.queryByText('Corte')).not.toBeInTheDocument()
    expect(screen.getByText('Tinte')).toBeInTheDocument()
  })

  it('cierra modal al hacer clic fuera', async () => {
    await act(async () => { render(<GestionServicios />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo servicio')) })
    const overlay = document.querySelector('.gs-overlay')
    await act(async () => { fireEvent.click(overlay) })
    expect(screen.queryByRole('heading', { name: 'Nuevo servicio' })).not.toBeInTheDocument()
  })
})