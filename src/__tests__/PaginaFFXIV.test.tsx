import { render } from '@testing-library/react';
import PaginaFFXIV from '../components/Pages/PaginaFFXIV';
import { describe, it, expect } from 'vitest';

describe('PaginaFFXIV', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaginaFFXIV />);
    expect(container).toBeTruthy();
  });
});
