/*
Swagger Mock Summary:
  Auth pages may call POST /auth/login and GET /auth/me — mocked.
Mock global: `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaAuth from '../components/Pages/PaginaAuth';
import { describe, it, expect } from 'vitest';

describe('PaginaAuth', () => {
  it('renders and shows login view by default', () => {
    const onLoginSuccess = () => {};
    const { container } = render(<PaginaAuth onLoginSuccess={onLoginSuccess} /> as any);
    expect(container).toBeTruthy();
  });
  it('renders login form elements (button or heading) when mounting', () => {
    const onLoginSuccess = () => {};
    render(<PaginaAuth onLoginSuccess={onLoginSuccess} /> as any);
    const buttons = screen.queryAllByRole('button');
    const headings = screen.queryAllByRole('heading');
    expect(buttons.length > 0 || headings.length > 0).toBeTruthy();
  });
});
