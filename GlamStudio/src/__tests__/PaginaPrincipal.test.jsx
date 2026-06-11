import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PaginaPrincipal from '../Pages/PaginaPrincipal'

describe('PaginaPrincipal', () => {
  it('renderiza el título GLAM STUDIO', async () => {
    await act(async () => { render(<MemoryRouter><PaginaPrincipal /></MemoryRouter>) })
    expect(screen.getByText('GLAM STUDIO')).toBeInTheDocument()
  })

  it('muestra 4 botones Abrir', async () => {
    await act(async () => { render(<MemoryRouter><PaginaPrincipal /></MemoryRouter>) })
    expect(screen.getAllByText('Abrir')).toHaveLength(4)
  })
})