/*
Swagger Mock Summary:
  GET /api/posts/{id}
  POST /api/posts/{id}/comments
Mock global disponible en `src/test-utils/apiMock.ts`.
*/
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaginaPost from '../components/Pages/PaginaPost';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUser, getPosts, savePosts } from '../utils/validation';

if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  } as any;
}

describe('PaginaPost', () => {
  beforeEach(() => {
    localStorage.clear();
    saveUser({ rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' } as any);
    const posts = [{ id: 'pX', image: '/IMG/placeholder.jpg', title: 'X', category: 'EDITORIAL', author: 'a', date: '2025-01-01', likes: [], comments: [] }];
    savePosts(posts as any);
    // Simular ruta a /post/pX sin usar history.pushState (evita SecurityError en algunos entornos).
    // Definimos solo la propiedad `location` con pathname/href esperados por el componente.
    if (typeof window !== 'undefined') {
      try {
        // Evitar llamar a pushState porque en algunos entornos de test el base URL es about:blank
        // y eso lanza SecurityError. En su lugar, definimos location de forma controlada.
        const loc = { href: 'http://localhost/post/pX', pathname: '/post/pX' } as any;
          try {
          // Si location es configurable, reemplazarla
          Object.defineProperty(window, 'location', { value: loc, configurable: true });
        } catch (e) {
          // Si no es configurable, intentar mutar las propiedades individualmente
          try { (window as any).location = loc; } catch (e) { /* ignorar */ }
        }
      } catch (e) {
        // último recurso: asignar en globalThis sin tocar el objeto window existente
        (globalThis as any).location = { href: 'http://localhost/post/pX', pathname: '/post/pX' } as any;
      }
    }
  });

  it('permite comentar si hay usuario activo', () => {
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'tester' }));
    render(<PaginaPost />);
    const textarea = screen.getByPlaceholderText(/Escribe tu comentario/i);
    fireEvent.change(textarea, { target: { value: 'Buen post!' } });
    const btn = screen.getByRole('button', { name: /Comentar/i });
    fireEvent.click(btn);
    const posts = getPosts();
    expect(posts.find((p:any) => p.id === 'pX')?.comments?.some((c:any) => c.text === 'Buen post!')).toBe(true);
  });
  it('muestra sección de comentarios al renderizar post existente', () => {
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'tester' }));
    render(<PaginaPost />);
    const matches = screen.queryAllByText(/Comentarios/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('llama POST /api/posts/:id/comments al comentar', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'tester' }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<PaginaPost />);
    const textarea = screen.getByPlaceholderText(/Escribe tu comentario/i);
    fireEvent.change(textarea, { target: { value: 'Prueba comentario' } });
    const btn = screen.getByRole('button', { name: /Comentar/i });
    fireEvent.click(btn);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const calledComment = fetchSpy.mock.calls.some((c: any) => typeof c[0] === 'string' && c[0].includes('/api/posts/pX/comments'));
    expect(calledComment).toBe(true);
    fetchSpy.mockRestore();
  });
});
