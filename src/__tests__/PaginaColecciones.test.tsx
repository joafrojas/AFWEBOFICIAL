import { render } from '@testing-library/react';
import PaginaColecciones from '../components/Pages/PaginaColecciones';
import { describe, it, expect } from 'vitest';

describe('PaginaColecciones', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaginaColecciones />);
    expect(container).toBeTruthy();
  });
});
