import React, { useEffect, useState } from 'react';
import { getActiveUser } from '../utils/validation';

const NavBar: React.FC<{ onLogout?: () => void; onNavigate?: (target: string) => void }> = ({ onLogout, onNavigate }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    // Confiar inicialmente en el flag local `currentUser.isAdmin` para buena UX,
    // y confirmar con el backend en segundo plano. Si el backend contradice,
    // ocultamos el panel de admin.
    useEffect(() => {
        let mounted = true;

        const evaluateLocal = () => {
            try {
                const raw = localStorage.getItem('currentUser');
                if (!raw) { if (mounted) setIsAdmin(false); return null; }
                const parsed = JSON.parse(raw) as any;

                // Detectar admin localmente usando múltiples claves/valores posibles
                const tryBool = (v: any) => v === true || v === 'true' || v === '1' || v === 1;
                const hasAdminFlag = tryBool(parsed?.isAdmin) || tryBool(parsed?.admin) || tryBool(parsed?.is_admin);
                const rol = parsed?.rol || parsed?.role || parsed?.roles || parsed?.rolesList;
                const rolString = typeof rol === 'string' ? rol : '';
                const rolArray = Array.isArray(rol) ? rol : [];
                const rolAdmin = rolString.toUpperCase().includes('ADMIN') || rolArray.includes('ROLE_ADMIN') || rolArray.includes('ADMIN');
                const correo = parsed?.correo || parsed?.email || '';
                const username = parsed?.nombre_usu || parsed?.nombreUsuario || parsed?.username || parsed?.user || '';
                const usernameAdmin = String(username).toLowerCase() === 'admin' || String(username).toLowerCase().includes('admin');

                const localAdmin = Boolean(hasAdminFlag || rolAdmin || (correo && String(correo).toLowerCase().endsWith('@asfaltofashion.cl')) || usernameAdmin);
                if (mounted) setIsAdmin(localAdmin);
                return { parsed, localAdmin };
            } catch (e) {
                return null;
            }
        };

        const confirmBackend = async (parsed: any, localAdminFallback: boolean) => {
            try {
            if (!parsed) { if (mounted) { /* keep localAdminFallback */ } return; }
            const userId = parsed?.id || parsed?.userId || null;
            const username = parsed?.nombreUsuario || parsed?.nombre_usu || parsed?.nombre || parsed?.user || parsed?.username || null;
            const correo = parsed?.correo || parsed?.email || null;

                let found: any = null;
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                const authHeaders: any = token ? { 'Authorization': `Bearer ${token}` } : {};
                if (userId != null) {
                    try {
                        // Preferir endpoint dedicado `/auth/me` o `/users/me` con token
                        try {
                                const rAuth = await fetch('/auth/me', { headers: authHeaders });
                            if (rAuth.ok) found = await rAuth.json();
                        } catch (e) { /* noop */ }
                        if (!found) {
                                const r = await fetch(`/users/me?id=${encodeURIComponent(String(userId))}`, { headers: authHeaders });
                            if (r.ok) found = await r.json();
                        }
                    } catch (e) {
                        // fallar hacia abajo
                    }
                }

                if (!found) {
                    try {
                            const res = await fetch('/users', { headers: authHeaders });
                        if (!res.ok) return;
                        const users = await res.json();
                        if (username) {
                            found = (users || []).find((u: any) => {
                                const candidate = u.nombreUsuario || u.nombre_usu || u.user || u.username || '';
                                return String(candidate) === String(username);
                            });
                        }
                        if (!found && correo) {
                            found = (users || []).find((u: any) => String(u.correo) === String(correo));
                        }
                    } catch (e) {
                        return;
                    }
                }

                if (!found) {
                    // Si backend no encuentra al usuario, no revocar el flag local (localAdminFallback)
                    if (correo && String(correo).toLowerCase().endsWith('@asfaltofashion.cl')) {
                        if (mounted) setIsAdmin(true || localAdminFallback);
                        return;
                    }
                    if (mounted) setIsAdmin(Boolean(localAdminFallback));
                    return;
                }
                const isAdminBackend = found.isAdmin === true || found.admin === true || (typeof found.rol === 'string' && found.rol.toUpperCase().includes('ADMIN')) || (Array.isArray(found.rol) && found.rol.includes('ROLE_ADMIN')) || (Array.isArray(found.roles) && found.roles.includes('ROLE_ADMIN')) || (typeof found.role === 'string' && found.role.toUpperCase().includes('ADMIN'));
                if (mounted) setIsAdmin(Boolean(isAdminBackend) || Boolean(localAdminFallback));
            } catch (e) {
                // no bloquear la UI por fallo de red
            }
        };

        const runCheck = () => {
            const evalRes = evaluateLocal();
            const parsed = evalRes?.parsed || null;
            const localAdmin = Boolean(evalRes?.localAdmin);
            // Si evaluateLocal no devolvió nada, intentar obtener active desde helper central
            const activeFallback = getActiveUser();
            const effective = parsed || activeFallback || null;
            try { console.debug('[NavBar] effective currentUser:', effective, 'localAdmin:', localAdmin); } catch (e) { }
            void confirmBackend(effective, localAdmin).then(() => {
                try { console.debug('[NavBar] isAdmin state after backend check:', isAdmin); } catch (e) { }
            });
        };

        // Ejecutar la evaluación inicial
        runCheck();

        // Escuchar cambios de autenticación para actualizar sin recargar
        const onAuthUpdated = () => runCheck();
        const onStorage = (ev: StorageEvent) => {
            if (ev.key === 'currentUser' || ev.key === 'authToken') runCheck();
        };
        window.addEventListener('asfalto_auth_updated', onAuthUpdated as EventListener);
        window.addEventListener('storage', onStorage as EventListener);

        return () => {
            mounted = false;
            window.removeEventListener('asfalto_auth_updated', onAuthUpdated as EventListener);
            window.removeEventListener('storage', onStorage as EventListener);
        };
    }, []);

    const navTo = (path: string, fallback: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof window === 'undefined') return;

        // Preferir navegación SPA cuando sea posible: actualizar URL y disparar
        // un evento `popstate` para que la app principal reevalúe la ruta sin recargar.
        try {
            if (window.location.pathname !== path) {
                window.history.pushState({}, '', path);
                window.dispatchEvent(new Event('popstate'));
                return;
            }
        } catch (err) {
            // En caso de error, caer de regreso a la navegación completa
            try { window.location.href = path; return; } catch (e) { /* noop */ }
        }

        if (typeof onNavigate === 'function') onNavigate(fallback);
    };

    // No hay botón de demo en producción. Los admins deben obtener su flag desde el backend.

    return (
        <header className="main-nav-container">
            <nav className="navbarAsfalto">
                <ul className="menuNav menuNav-left">
                    <li><a href="#" onClick={navTo('/', 'todos')}>INICIO</a></li>
                    <li><a href="#" onClick={navTo('/colecciones', 'colecciones')}>COLECCIÓN</a></li>
                </ul>

                <div className="logoNav">
                    <img src="/IMG/asfaltofashion.png" alt="ASFALTO FASHION Logo" className="nav-logo-img" />
                </div>

                <ul className="menuNav menuNav-right">
                    <li><a href="#" onClick={navTo('/contacto', 'contacto')}>CONTACTO</a></li>
                    {isAdmin && (
                        <li>
                            <button
                                onClick={navTo('/admin', 'admin') as any}
                                className="btn-admin"
                                aria-label="Ir al panel de administración"
                                title="Panel Admin"
                                style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
                            >
                                PANEL
                            </button>
                        </li>
                    )}
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="nav-user-item">
                                <button onClick={() => { if (onLogout) onLogout(); else window.location.href = '/'; }} className="logout-btn">Cerrar Sesión</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default NavBar;
