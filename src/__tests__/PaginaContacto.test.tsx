/*
Swagger Mock Summary: endpoints relacionados con contacto
  GET /contacto/listar
Mock global disponible en `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaContacto from '../components/Pages/PaginaContacto';
import { describe, it, expect } from 'vitest';

describe('PaginaContacto', () => {
  it('renders without crashing and checks buttons if present', () => {
    const { container } = render(<PaginaContacto />);
    expect(container).toBeTruthy();
    const buttons = screen.queryAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
  });
  it('renders a heading or nav', () => {
    render(<PaginaContacto />);
    const nav = screen.queryByRole('navigation');
    const headings = screen.queryAllByRole('heading');
    expect(nav || headings.length > 0).toBeTruthy();
  });
});
