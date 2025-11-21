import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import '../../styles/Admin.css';
import { ADMIN_TOKEN } from '../../utils/validation';

// Versión sencilla y robusta de PaginaAdmin.
// - Usa localStorage.currentUser para decidir visibilidad de panel admin (fallback por dominio).
// - Permite cargar usuarios y posts desde los microservicios y borrarlos.
// - Minimal: fácil de entender y depurar cuando el botón Admin no aparece.

type User = any;
type Post = any;

const ADMIN_EMAIL_DOMAIN = '@asfaltofashion.cl';

function getLocalCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const PaginaAdmin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const u = getLocalCurrentUser();
    setUser(u);
    const adminFlag = !!(u && (u.isAdmin === true || (u.correo && String(u.correo).endsWith(ADMIN_EMAIL_DOMAIN))));
    setIsAdmin(adminFlag);
  }, []);

  // Cargar usuarios desde el microservicio `usuarios`
  const loadUsers = async () => {
    setLoadingUsers(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:8081/users');
      if (!res.ok) throw new Error(`users ${res.status}`);
      const body = await res.json();
      setUsers(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar usuarios: ' + (e?.message || e));
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar contactos desde microservicio `contacto`
  const loadContacts = async () => {
    setLoadingContacts(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:8080/contacto/listar');
      if (!res.ok) throw new Error(`contacts ${res.status}`);
      const body = await res.json();
      setContacts(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar las solicitudes de contacto: ' + (e?.message || e));
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Cargar posts desde el microservicio `foro`
  const loadPosts = async () => {
    setLoadingPosts(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:8082/api/posts');
      if (!res.ok) throw new Error(`posts ${res.status}`);
      const body = await res.json();
      setPosts(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar publicaciones: ' + (e?.message || e));
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!isAdmin) { alert('Solo administradores pueden borrar usuarios.'); return; }
    const ok = window.confirm(`Eliminar usuario ${u.nombre || u.nombre_usu || u.username}? Esta acción es irreversible.`);
    if (!ok) return;
    try {
      const id = u.id || u.userId || u.user_id;
      const res = await fetch(`http://localhost:8081/users/${id}`, { method: 'DELETE', headers: { 'X-ADMIN-TOKEN': ADMIN_TOKEN } });
      if (!res.ok) throw new Error(String(res.status));
      // actualizar lista local
      setUsers(prev => prev.filter(x => (x.id || x.userId || x.user_id) !== id));
      setMessage('Usuario eliminado en el servicio de usuarios.');
    } catch (e: any) {
      setMessage('Error borrando usuario: ' + (e?.message || e));
    }
  };

  const handleToggleAdmin = async (u: User) => {
    if (!isAdmin) { alert('Solo administradores pueden cambiar roles.'); return; }
    try {
      const id = u.id || u.userId || u.user_id;
      const nextValue = !Boolean(u.isAdmin);
      const res = await fetch(`http://localhost:8081/users/${id}/admin`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': ADMIN_TOKEN }, body: JSON.stringify({ isAdmin: nextValue }) });
      if (!res.ok) throw new Error(String(res.status));
      setUsers(prev => prev.map(x => ((x.id || x.userId || x.user_id) === id ? { ...x, isAdmin: nextValue } : x)));
      setMessage(`Rol actualizado. isAdmin=${nextValue}`);
    } catch (e: any) {
      setMessage('Error actualizando rol: ' + (e?.message || e));
    }
  };

  const handleDeletePost = async (p: Post) => {
    if (!isAdmin) { alert('Solo administradores pueden borrar publicaciones.'); return; }
    const ok = window.confirm(`Eliminar publicación ${p.title || p.id}?`);
    if (!ok) return;
    try {
      const id = p.externalId || p.id;
      const res = await fetch(`http://localhost:8082/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      setPosts(prev => prev.filter(x => (x.externalId || x.id) !== id));
      setMessage('Publicación eliminada.');
    } catch (e: any) {
      setMessage('Error borrando publicación: ' + (e?.message || e));
    }
  };

  const handleDeleteContact = async (c: any) => {
    if (!isAdmin) { alert('Solo administradores pueden borrar solicitudes de contacto.'); return; }
    const ok = window.confirm(`Eliminar solicitud de contacto de ${c.nombre || c.email || c.id}?`);
    if (!ok) return;
    try {
      const id = c.id;
      const res = await fetch(`http://localhost:8080/contacto/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      setContacts(prev => prev.filter(x => x.id !== id));
      setMessage('Solicitud de contacto eliminada.');
    } catch (e: any) {
      setMessage('Error eliminando contacto: ' + (e?.message || e));
    }
  };

  // UI simple: si no es admin, mostrar mensaje claro y cómo forzar para pruebas.
  if (!user) {
    return (
      <div className="admin-page">
        <NavBar />
        <main className="admin-main">
          <h1>Panel Admin</h1>
          <p>No has iniciado sesión. Inicia sesión para ver el panel administrativo.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <NavBar />
      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Panel Administrativo</h1>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14 }}><strong>{user.nombre || user.nombre_usu || user.username}</strong></div>
            <div style={{ marginTop: 6 }}>
              <span style={{ padding: '6px 10px', background: isAdmin ? '#198754' : '#6c757d', color: '#fff', borderRadius: 6 }}>{isAdmin ? 'ADMIN' : 'NO ADMIN'}</span>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: 6, background: '#fff8' }}>
            <p>Tu cuenta no tiene rol de administrador según `localStorage`.</p>
            <p>Para pruebas rápidas, puedes marcar manualmente `isAdmin: true` en `localStorage.getItem('currentUser')` desde la consola del navegador y recargar la página.</p>
          </div>
        )}

        {isAdmin && (
          <>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button onClick={loadUsers} disabled={loadingUsers}>{loadingUsers ? 'Cargando usuarios...' : 'Cargar usuarios'}</button>
              <button onClick={loadPosts} disabled={loadingPosts}>{loadingPosts ? 'Cargando posts...' : 'Cargar posts'}</button>
              <button onClick={() => { setMessage(null); setUsers([]); setPosts([]); }}>Limpiar</button>
            </div>

            {message && <div style={{ marginTop: 12, color: '#b71c1c' }}>{message}</div>}

            <section style={{ marginTop: 20 }}>
              <h2>Usuarios</h2>
              {users.length === 0 ? <p>No hay usuarios cargados.</p> : (
                <ul>
                  {users.map(u => (
                    <li key={(u.id || u.userId || u.user_id || u.nombre_usu || u.correo)} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                      <div>
                        <div><strong>{u.nombre || u.nombre_usu || u.username}</strong></div>
                        <div style={{ fontSize: 12, color: '#666' }}>{u.correo}</div>
                      </div>
                      <div>
                        <button onClick={() => handleToggleAdmin(u)} style={{ marginLeft: 8 }}>{u.isAdmin ? 'Quitar admin' : 'Dar admin'}</button>
                        <button onClick={() => handleDeleteUser(u)} style={{ marginLeft: 8 }}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 20 }}>
              <h2>Contactos</h2>
              <div style={{ marginBottom: 8 }}>
                <button onClick={loadContacts} disabled={loadingContacts}>{loadingContacts ? 'Cargando contactos...' : 'Cargar contactos'}</button>
              </div>
              {contacts.length === 0 ? <p>No hay solicitudes de contacto cargadas.</p> : (
                <ul>
                  {contacts.map(c => (
                    <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                      <div>
                        <div><strong>{c.nombre}</strong> <span style={{ fontSize: 12, color: '#666' }}>({c.email})</span></div>
                        <div style={{ fontSize: 12, color: '#333' }}>{c.mensaje}</div>
                      </div>
                      <div>
                        <button onClick={() => handleDeleteContact(c)}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 20 }}>
              <h2>Publicaciones</h2>
              {posts.length === 0 ? <p>No hay publicaciones cargadas.</p> : (
                <ul>
                  {posts.map(p => (
                    <li key={(p.externalId || p.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                      <div>
                        <div><strong>{p.title || p.titleText || p.id}</strong></div>
                        <div style={{ fontSize: 12, color: '#666' }}>{p.authorId || p.author || '—'}</div>
                      </div>
                      <div>
                        <button onClick={() => handleDeletePost(p)}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PaginaAdmin;
