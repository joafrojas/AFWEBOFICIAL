import { render } from '@testing-library/react';
import PaginaContacto from '../components/Pages/PaginaContacto';
import { describe, it, expect } from 'vitest';

describe('PaginaContacto', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaginaContacto />);
    expect(container).toBeTruthy();
  });
});
