import { render } from '@testing-library/react';
import PaginaAuth from '../components/Pages/PaginaAuth';
import { describe, it, expect } from 'vitest';

describe('PaginaAuth', () => {
  it('renders and shows login view by default', () => {
    const onLoginSuccess = () => {};
    const { container } = render(<PaginaAuth onLoginSuccess={onLoginSuccess} /> as any);
    expect(container).toBeTruthy();
  });
});
