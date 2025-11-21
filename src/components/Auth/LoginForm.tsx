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
            const res = await fetch('http://localhost:8081/auth/login', {
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
            const username = json.username || usuario;
            const isAdmin = !!json.isAdmin;
            const createdAt = json.createdAt || '';
            const correo = json.correo || '';
            const fechaNac = json.fechaNac || '';
            const userId = json.userId || null;

            // guardar token y usuario mínimo (incluye id, createdAt, correo y fecha_nac)
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify({ id: userId, nombre_usu: username, correo, isAdmin, createdAt, fecha_nac: fechaNac }));
            // Notificar a la app que cambió el usuario autenticado (para actualizar NavBar sin recargar)
            try { window.dispatchEvent(new Event('asfalto_auth_updated')); } catch (e) { /* noop */ }

            const userAny = { id: userId, rut: '', nombre: '', fecha_nac: fechaNac, correo: correo, nombre_usu: username, password: '', createdAt } as any;
            onSuccess(userAny as UserData);
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