import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
  it('renders and has contentinfo role', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeTruthy();
  });
});
