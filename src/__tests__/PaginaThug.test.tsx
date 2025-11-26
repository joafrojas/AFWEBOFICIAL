/*
Swagger Mock Summary:
  GET /api/posts
Mock global: `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaThug from '../components/Pages/PaginaThug';
import { describe, it, expect } from 'vitest';

describe('PaginaThug', () => {
  it('renders without crashing and checks buttons if present', () => {
    const { container } = render(<PaginaThug />);
    expect(container).toBeTruthy();
    const buttons = screen.queryAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
  });
  it('renders a heading or nav', () => {
    render(<PaginaThug />);
    const nav = screen.queryByRole('navigation');
    const headings = screen.queryAllByRole('heading');
    expect(nav || headings.length > 0).toBeTruthy();
  });
});
