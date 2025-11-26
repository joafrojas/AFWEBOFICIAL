// Formulario de login (cliente): envía credenciales al backend y guarda token.
import React, { useState, useRef } from 'react';
import { type UserData } from '../../utils/validation';

interface LoginFormProps {
    onSuccess: (user: UserData) => void;
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
    // estado: usuario
    const [usuario, setUsuario] = useState('');
    // estado: contraseña
    const [password, setPassword] = useState('');
    // errores por campo
    const [fieldErrors, setFieldErrors] = useState<{usuario?:string; password?:string}>({});
    // mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    // Manejo del submit de login: validaciones simples y POST al backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // limpiar errores
        setFieldErrors({});
        const errors: Record<string, string> = {};

        // validación básica
        if (!usuario) errors.usuario = 'Ingresa tu usuario';
        if (!password) errors.password = 'Ingresa tu contraseña';
        if (Object.keys(errors).length) return setFieldErrors(errors);

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: usuario, password }),
            });
            if (!res.ok) {
                const text = await res.text();
                setFieldErrors({ password: text || 'Credenciales inválidas' });
                return;
            }
            const json = await res.json();
            const token = json.token;
            // Guardar el token y un objeto "currentUser" mínimo en localStorage
            localStorage.setItem('authToken', token);

            // Construir el usuario con la información devuelta por /auth/login
            const userAny = {
                id: json.userId || json.id || null,
                nombre_usu: json.username || json.userName || usuario,
                nombre: json.nombre || json.fullName || '',
                correo: json.email || json.correo || '',
                fecha_nac: json.fechaNac || '',
                createdAt: json.createdAt || '',
                // Determinar isAdmin por flag explícito o por dominio de correo
                isAdmin: Boolean(json.isAdmin) || (json.email || json.correo || '').toString().endsWith('@asfaltofashion.cl')
            } as any;

            // Intentar obtener perfil completo desde el backend (/auth/me o /users/me)
            let finalUser: any = userAny;
            try {
                const authHeaders: Record<string,string> = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
                // Preferir /auth/me
                try {
                    const r = await fetch('/auth/me', { headers: authHeaders });
                    if (r.ok) {
                        const p = await r.json();
                        finalUser = p;
                    }
                } catch (e) { /* noop */ }

                // Si no obtuvimos perfil, intentar /users/me (backend soporta ?id=... but also /users/me)
                if (!finalUser || !finalUser.id) {
                    try {
                        const r2 = await fetch('/users/me', { headers: authHeaders });
                        if (r2.ok) {
                            const p2 = await r2.json();
                            finalUser = p2;
                        }
                    } catch (e) { /* noop */ }
                }

            } catch (e) {
                // si todo falla, usamos el objeto mínimo construido arriba
            }

            try {
                localStorage.setItem('currentUser', JSON.stringify(finalUser));
                window.dispatchEvent(new Event('asfalto_auth_updated'));
                try { console.info('[LoginForm] stored currentUser and dispatching asfalto_auth_started'); } catch (e) {}
                try { window.dispatchEvent(new Event('asfalto_auth_started')); } catch (e) {}
            } catch (e) { /* noop */ }

            // Informar al app y forzar la URL de carga sin recargar la página.
            onSuccess(finalUser as UserData);
            try {
                if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/?forceCarga=1');
                    // opcional: disparar evento de navegación para que la app actualice ruta
                    try { window.dispatchEvent(new Event('asfalto_navigate')); } catch (e) {}
                }
            } catch (e) { /* noop */ }
        } catch (err: any) {
            setFieldErrors({ password: err?.message || 'Error conectando al servidor' });
        }
    };

    return (
        <form id="loginForm" onSubmit={handleSubmit} noValidate>
            <h2>Iniciar Sesión</h2>

            <div className="form-body">
            <label className="field">
                {/* campo: usuario */}
                <input type="text" id="usuario" placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} />
                {fieldErrors.usuario && <div className="field-error">{fieldErrors.usuario}</div>}
            </label>

            <label className="field password-field">
                {/* campo: contraseña */}
                <div className="password-inner">
                    <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => {
                            setShowPassword(s => {
                                const next = !s;
                                setTimeout(() => passwordRef.current?.focus(), 0);
                                return next;
                            });
                        }}
                        aria-pressed={showPassword}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                        </label>
                        </div>

                        <div className="form-message">
                            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                        </div>

                        <button type="submit" className="btn-primary">Ingresar</button>
            <p className="link">¿No tienes cuenta? <a onClick={onSwitchToRegister}>Regístrate</a></p>
        </form>
    );
};

export default LoginForm;