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
  const [serviceStatus, setServiceStatus] = useState<Record<string,string>>({});

  useEffect(() => {
    const u = getLocalCurrentUser();
    setUser(u);
    const adminFlag = !!(u && (u.isAdmin === true || (u.correo && String(u.correo).endsWith(ADMIN_EMAIL_DOMAIN))));
    setIsAdmin(adminFlag);
    // No precargamos datos locales: el panel debe usar exclusivamente los microservicios.
  }, []);

  // Cargar usuarios desde el microservicio `usuarios`
  const loadUsers = async () => {
    setLoadingUsers(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string,string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/users', { headers });
      if (!res.ok) throw new Error(`users ${res.status}`);
      const body = await res.json();
      setUsers(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar usuarios desde el servicio: ' + (e?.message || e));
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
      const res = await fetch('/contacto/listar');
      if (!res.ok) throw new Error(`contacts ${res.status}`);
      const body = await res.json();
      setContacts(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar las solicitudes de contacto desde el servicio: ' + (e?.message || e));
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
      const token = localStorage.getItem('authToken');
      const headers: Record<string,string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/posts', { headers });
      if (!res.ok) throw new Error(`posts ${res.status}`);
      const body = await res.json();
      setPosts(Array.isArray(body) ? body : []);
    } catch (e: any) {
      setMessage('No se pudieron cargar publicaciones desde el servicio: ' + (e?.message || e));
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Verificar conectividad con los microservicios (útil para depurar CORS / availability)
  const checkServices = async () => {
    setMessage(null);
    const endpoints: { key: string; url: string }[] = [
      { key: 'usuarios', url: '/users' },
      { key: 'contacto', url: '/contacto/listar' },
      { key: 'foro', url: '/api/posts' },
    ];
    const next: Record<string,string> = {};
    await Promise.all(endpoints.map(async (ep) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const token = localStorage.getItem('authToken');
        const headers: Record<string,string> = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(ep.url, { method: 'GET', headers, signal: controller.signal });
        clearTimeout(timer);
        next[ep.key] = res.ok ? `OK (${res.status})` : `ERROR (${res.status})`;
      } catch (err: any) {
        console.error('[PaginaAdmin] checkServices ', ep.url, err);
        next[ep.key] = (err?.name === 'AbortError') ? 'Timeout' : String(err?.message || err);
      }
    }));
    setServiceStatus(next);
    const down = Object.entries(next).filter(([,v]) => !v.startsWith('OK'));
    if (down.length > 0) setMessage('Algunos servicios no están disponibles. Revisa la consola o CORS en los microservicios.');
    else setMessage('Todos los servicios responden correctamente.');
  };

  const handleDeleteUser = async (u: User) => {
    if (!isAdmin) { alert('Solo administradores pueden borrar usuarios.'); return; }
    const ok = window.confirm(`Eliminar usuario ${u.nombre || u.nombre_usu || u.username}? Esta acción es irreversible.`);
    if (!ok) return;
    try {
      const id = u.id || u.userId || u.user_id || u.nombre_usu || u.correo;
      const token = localStorage.getItem('authToken');
      const headers: Record<string,string> = { 'X-ADMIN-TOKEN': ADMIN_TOKEN };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Intentar borrar en el microservicio (proxy via /users)
      const res = await fetch(`/users/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(String(res.status));
      // actualizar lista solo tras éxito remoto
      setUsers(prev => prev.filter(x => (x.id || x.userId || x.user_id || x.nombre_usu || x.correo) !== id));
      setMessage('Usuario eliminado en el servicio de usuarios.');
    } catch (e: any) {
      console.error('[PaginaAdmin] handleDeleteUser error', e);
      setMessage('Error borrando usuario en el servicio: ' + (e?.message || e));
    }
  };

  const handleToggleAdmin = async (u: User) => {
    if (!isAdmin) { alert('Solo administradores pueden cambiar roles.'); return; }
    try {
      const id = u.id || u.userId || u.user_id || u.nombre_usu || u.correo;
      const nextValue = !Boolean(u.isAdmin);

      const token = localStorage.getItem('authToken');
      // No blocking here: allow toggling any account (server will persist)

      const headers: Record<string,string> = { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': ADMIN_TOKEN };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Realizar la petición remota primero
      const res = await fetch(`/users/${id}/admin`, { method: 'PUT', headers, body: JSON.stringify({ isAdmin: nextValue }) });
      if (!res.ok) throw new Error(String(res.status));

      // Solo al confirmarse el éxito remoto actualizamos el estado
      setUsers(prev => {
        const next = prev.map(x => ((x.id || x.userId || x.user_id || x.nombre_usu || x.correo) === id ? { ...x, isAdmin: nextValue } : x));
        return next;
      });
      setMessage(`Rol actualizado en el servicio. isAdmin=${nextValue}`);

      // Si el usuario modificado es el usuario actualmente logueado, sincronizar desde el microservicio
      try {
        const local = getLocalCurrentUser();
        const localId = local && (local.id || local.userId || local.user_id || local.nombre_usu || local.correo);
        if (local && String(localId) === String(id)) {
          const token = localStorage.getItem('authToken');
          const headers: Record<string,string> = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          try {
            const r = await fetch(`/users/${encodeURIComponent(String(id))}`, { headers });
            if (r.ok) {
              const updated = await r.json();
              localStorage.setItem('currentUser', JSON.stringify(updated));
              setUser(updated);
              setIsAdmin(!!updated.isAdmin);
              try { window.dispatchEvent(new Event('asfalto_auth_updated')); } catch (e) { /* noop */ }
            } else {
              // Fallback: si no pudimos obtener el usuario desde el servicio, mantenemos la actualización local
              const updatedLocal = { ...local, isAdmin: nextValue };
              localStorage.setItem('currentUser', JSON.stringify(updatedLocal));
              setUser(updatedLocal);
              setIsAdmin(!!updatedLocal.isAdmin);
              try { window.dispatchEvent(new Event('asfalto_auth_updated')); } catch (e) { /* noop */ }
            }
          } catch (err) {
            console.warn('[PaginaAdmin] fallo al obtener usuario actualizado desde servicio, usando fallback local', err);
            const updatedLocal = { ...local, isAdmin: nextValue };
            localStorage.setItem('currentUser', JSON.stringify(updatedLocal));
            setUser(updatedLocal);
            setIsAdmin(!!updatedLocal.isAdmin);
            try { window.dispatchEvent(new Event('asfalto_auth_updated')); } catch (e) { /* noop */ }
          }
        }
      } catch (err) {
        console.warn('[PaginaAdmin] no se pudo sincronizar currentUser en localStorage', err);
      }
    } catch (e: any) {
      console.error('[PaginaAdmin] handleToggleAdmin error', e);
      setMessage('Error actualizando rol en el servicio: ' + (e?.message || e));
    }
  };

  const handleDeletePost = async (p: Post) => {
    if (!isAdmin) { alert('Solo administradores pueden borrar publicaciones.'); return; }
    const ok = window.confirm(`Eliminar publicación ${p.title || p.id}?`);
    if (!ok) return;
    try {
      const id = p.externalId || p.id;
      const token = localStorage.getItem('authToken');
      const headers: Record<string,string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE', headers });
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
      const res = await fetch(`/contacto/${id}`, { method: 'DELETE' });
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
              <span className={isAdmin ? 'admin-badge' : 'admin-badge badge-muted'}>{isAdmin ? 'ADMIN' : 'NO ADMIN'}</span>
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
            <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-admin" onClick={loadUsers} disabled={loadingUsers}>{loadingUsers ? 'Cargando usuarios...' : 'Cargar usuarios'}</button>
              <button className="btn-admin" onClick={loadPosts} disabled={loadingPosts}>{loadingPosts ? 'Cargando posts...' : 'Cargar posts'}</button>
              <button className="btn-secondary" onClick={() => { setMessage(null); setUsers([]); setPosts([]); }}>Limpiar</button>
              <button className="btn-admin" onClick={checkServices} style={{ marginLeft: 8 }}>Verificar servicios</button>
            </div>

            {Object.keys(serviceStatus).length > 0 && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <strong>Estado servicios:</strong> {Object.entries(serviceStatus).map(([k,v]) => (<span key={k} style={{ marginLeft: 8 }}>{k}: {v}</span>))}
              </div>
            )}

            {message && <div style={{ marginTop: 12, color: '#b71c1c' }}>{message}</div>}

            <section style={{ marginTop: 20 }}>
              <h2>Usuarios</h2>
              {users.length === 0 ? <p>No hay usuarios cargados.</p> : (
                <ul>
                  {users.map(u => (
                    <li key={(u.id || u.userId || u.user_id || u.nombre_usu || u.correo)} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                      <div>
                        <div><strong>{u.nombre || u.nombre_usu || u.username}</strong></div>
                        <div style={{ fontSize: 12, color: '#fa8b8bff' }}>{u.correo}</div>
                      </div>
                      <div>
                          {/**
                           * Do not allow toggling admin for internal domain users (they are always admins).
                           * Show a disabled ADMIN label for those accounts.
                           */}
                          {(() => {
                            return (
                              <>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleToggleAdmin(u)}
                                  style={{ marginLeft: 8 }}
                                >
                                  {u.isAdmin ? 'Quitar admin' : 'Dar admin'}
                                </button>
                              </>
                            );
                          })()}
                          <button className="btn-danger" onClick={() => handleDeleteUser(u)} style={{ marginLeft: 8 }}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 20 }}>
              <h2>Contactos</h2>
              <div style={{ marginBottom: 8 }}>
                <button className="btn-admin" onClick={loadContacts} disabled={loadingContacts}>{loadingContacts ? 'Cargando contactos...' : 'Cargar contactos'}</button>
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
                        <button className="btn-danger" onClick={() => handleDeleteContact(c)}>Eliminar</button>
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
                        <div style={{ fontSize: 12, color: '#cac9c9ff' }}>{p.authorId || p.author || '—'}</div>
                      </div>
                      <div>
                        <button className="btn-danger" onClick={() => handleDeletePost(p)}>Eliminar</button>
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
