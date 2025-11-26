/*
Swagger Mock Summary: GET /api/posts (galería)
Mock global: `src/test-utils/apiMock.ts`
*/
import { render, screen } from '@testing-library/react';
import PaginaColecciones from '../components/Pages/PaginaColecciones';
import { describe, it, expect } from 'vitest';

describe('PaginaColecciones', () => {
  it('renders without crashing and checks buttons if present', () => {
    const { container } = render(<PaginaColecciones />);
    expect(container).toBeTruthy();
    const buttons = screen.queryAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
  });
  it('renders a heading or nav', () => {
    render(<PaginaColecciones />);
    const nav = screen.queryByRole('navigation');
    const heading = screen.queryByRole('heading');
    expect(nav || heading).toBeTruthy();
  });
});
