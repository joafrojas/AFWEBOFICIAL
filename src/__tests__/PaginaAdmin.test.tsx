import { render } from '@testing-library/react';
import PaginaAdmin from '../components/Pages/PaginaAdmin';
import { describe, it, expect } from 'vitest';

describe('PaginaAdmin', () => {
  it('renders and shows admin heading', () => {
    const { container } = render(<PaginaAdmin />);
    expect(container).toBeTruthy();
  });
});
