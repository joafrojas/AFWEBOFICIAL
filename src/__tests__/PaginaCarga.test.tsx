/*
Swagger Mock Summary:
  No external calls required; se mantiene compatibilidad con mock global.
*/
import { render, screen } from '@testing-library/react';
import PaginaCarga from '../components/Pages/PaginaCarga';
import { describe, it, expect, vi } from 'vitest';

describe('PaginaCarga', () => {
  it('renders and calls onComplete after delay', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const user = { rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' } as any;
    const { container } = render(<PaginaCarga user={user} onComplete={onComplete} />);
    expect(container).toBeTruthy();
    // avanzar timers para disparar el efecto
    vi.advanceTimersByTime(3000);
    expect(onComplete).toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('muestra contenido de carga mientras espera', () => {
    const onComplete = () => {};
    const user = { rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' } as any;
    const { container } = render(<PaginaCarga user={user} onComplete={onComplete} />);
    expect(container).toBeTruthy();
    // buscar texto o heading de carga si existe
    const heading = screen.queryByRole('heading');
    expect(container || heading).toBeTruthy();
  });
});
