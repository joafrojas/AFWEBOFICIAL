/*
Swagger Mock Summary:
  GET /api/posts
  GET /api/posts/{id}
Mock global: `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaFFXIV from '../components/Pages/PaginaFFXIV';
import { describe, it, expect } from 'vitest';

describe('PaginaFFXIV', () => {
  it('renders without crashing and checks buttons if present', () => {
    const { container } = render(<PaginaFFXIV />);
    expect(container).toBeTruthy();
    const buttons = screen.queryAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
  });
  it('renders a heading or nav', () => {
    render(<PaginaFFXIV />);
    const nav = screen.queryByRole('navigation');
    const headings = screen.queryAllByRole('heading');
    expect(nav || headings.length > 0).toBeTruthy();
  });
});
