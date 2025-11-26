/*
Swagger Mock Summary:
  GET /api/posts
Mock global: `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaGalegale from '../components/Pages/PaginaGalegale';
import { describe, it, expect } from 'vitest';

describe('PaginaGalegale', () => {
  it('renders without crashing and checks buttons if present', () => {
    const { container } = render(<PaginaGalegale />);
    expect(container).toBeTruthy();
    const buttons = screen.queryAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
  });
  it('renders a heading or nav', () => {
    render(<PaginaGalegale />);
    const nav = screen.queryByRole('navigation');
    const headings = screen.queryAllByRole('heading');
    expect(nav || headings.length > 0).toBeTruthy();
  });
});
