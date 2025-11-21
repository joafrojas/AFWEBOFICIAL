import { render } from '@testing-library/react';
import PaginaGalegale from '../components/Pages/PaginaGalegale';
import { describe, it, expect } from 'vitest';

describe('PaginaGalegale', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaginaGalegale />);
    expect(container).toBeTruthy();
  });
});
