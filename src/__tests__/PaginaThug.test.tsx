import { render } from '@testing-library/react';
import PaginaThug from '../components/Pages/PaginaThug';
import { describe, it, expect } from 'vitest';

describe('PaginaThug', () => {
  it('renders without crashing', () => {
    const { container } = render(<PaginaThug />);
    expect(container).toBeTruthy();
  });
});
