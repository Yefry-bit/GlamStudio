import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../Pages/Navbar', () => ({ default: () => <div>Navbar</div> }))
vi.mock('../Pages/Login', () => ({ default: () => <div>Login</div> }))
vi.mock('../Pages/PaginaPrincipal', () => ({ default: () => <div>Principal</div> }))
vi.mock('../Pages/CitasPage', () => ({ default: () => <div>Citas</div> }))
vi.mock('../Pages/HistorialPage', () => ({ default: () => <div>Historial</div> }))
vi.mock('../Pages/GestionServicios', () => ({ default: () => <div>Servicios</div> }))
vi.mock('../Pages/GestionEncargados', () => ({ default: () => <div>Encargados</div> }))

import App from '../App'

describe('App', () => {
  it('renderiza la ruta / con Login', async () => {
    await act(async () => { render(<App />) })
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renderiza Navbar', async () => {
    await act(async () => { render(<App />) })
    expect(screen.getByText('Navbar')).toBeInTheDocument()
  })
})