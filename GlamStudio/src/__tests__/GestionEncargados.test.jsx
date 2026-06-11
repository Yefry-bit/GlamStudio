import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import GestionEncargados from '../Pages/GestionEncargados'
import { encargadosService } from '../Services/encargadosService'

vi.mock('../Services/encargadosService', () => ({
  encargadosService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }
}))

const mockData = [
  { idUsuario: 1, nombre: 'Carlos', telefono: '3001234567', rol: 'Barbero', username: 'carlos', password: '123' },
  { idUsuario: 2, nombre: 'Ana', telefono: '3009876543', rol: 'Administrador', username: 'ana', password: '456' },
]

describe('GestionEncargados', () => {
  beforeEach(() => {
    encargadosService.getAll.mockResolvedValue(mockData)
    encargadosService.create.mockResolvedValue({})
    encargadosService.update.mockResolvedValue({})
    encargadosService.remove.mockResolvedValue({})
    globalThis.confirm = vi.fn(() => true)
  })

  it('renderiza el título', async () => {
    await act(async () => { render(<GestionEncargados />) })
    expect(screen.getByText('Gestión de Encargados')).toBeInTheDocument()
  })

  it('muestra los encargados cargados', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => expect(screen.getByText('Carlos')).toBeInTheDocument())
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('muestra stats correctas', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => {
      const totales = screen.getAllByText('2')
      expect(totales.length).toBeGreaterThan(0)
    })
  })

  it('abre el modal al hacer clic en Nuevo encargado', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => screen.getByText('+ Nuevo encargado'))
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    expect(screen.getByRole('heading', { name: 'Nuevo encargado' })).toBeInTheDocument()
  })

  it('cierra el modal al hacer clic en Cancelar', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    await act(async () => { fireEvent.click(screen.getByText('Cancelar')) })
    expect(screen.queryByRole('heading', { name: 'Nuevo encargado' })).not.toBeInTheDocument()
  })

  it('muestra error si nombre está vacío al guardar', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    await act(async () => { fireEvent.click(screen.getByText('Crear encargado')) })
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
  })

  it('muestra error si teléfono no tiene 10 dígitos', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Ej: Rafael García'), { target: { value: 'Carlos' } })
      fireEvent.change(screen.getByPlaceholderText('Ej: 3001234567'), { target: { value: '123' } })
      fireEvent.click(screen.getByText('Crear encargado'))
    })
    expect(screen.getByText('El teléfono es obligatorio y debe tener 10 dígitos.')).toBeInTheDocument()
  })

  it('crea un encargado correctamente', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Ej: Rafael García'), { target: { value: 'Pedro' } })
      fireEvent.change(screen.getByPlaceholderText('Ej: 3001234567'), { target: { value: '3001112233' } })
      fireEvent.click(screen.getByText('Crear encargado'))
    })
    await waitFor(() => expect(encargadosService.create).toHaveBeenCalled())
  })

  it('abre modal de edición al hacer clic en Editar', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => screen.getAllByText('✏️ Editar'))
    await act(async () => { fireEvent.click(screen.getAllByText('✏️ Editar')[0]) })
    expect(screen.getByRole('heading', { name: 'Editar encargado' })).toBeInTheDocument()
  })

  it('elimina un encargado al confirmar', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => screen.getAllByText('🗑️ Eliminar'))
    await act(async () => { fireEvent.click(screen.getAllByText('🗑️ Eliminar')[0]) })
    await waitFor(() => expect(encargadosService.remove).toHaveBeenCalledWith(1))
  })

  it('no elimina si el usuario cancela', async () => {
    globalThis.confirm = vi.fn(() => false)
    encargadosService.remove.mockClear()
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => screen.getAllByText('🗑️ Eliminar'))
    await act(async () => { fireEvent.click(screen.getAllByText('🗑️ Eliminar')[0]) })
    expect(encargadosService.remove).not.toHaveBeenCalled()
  })

  it('filtra encargados por búsqueda', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await waitFor(() => screen.getByText('Carlos'))
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o rol...'), { target: { value: 'Ana' } })
    })
    expect(screen.queryByText('Carlos')).not.toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('cierra modal al hacer clic fuera', async () => {
    await act(async () => { render(<GestionEncargados />) })
    await act(async () => { fireEvent.click(screen.getByText('+ Nuevo encargado')) })
    const overlay = document.querySelector('.ge-overlay')
    await act(async () => { fireEvent.click(overlay) })
    expect(screen.queryByRole('heading', { name: 'Nuevo encargado' })).not.toBeInTheDocument()
  })
})