// Formulario de registro (cliente): valida campos y llama al backend
// para crear usuario y hacer login automático.
import React, { useState, useRef } from 'react';
import {
    validarRut,
    validarCorreo,
    validarPassword,
    validarEdad,
    isValidAdminToken,
} from '../../utils/validation';
import type { UserData } from '../../utils/validation';

interface RegisterFormProps {
    // onSuccess puede recibir opcionalmente el usuario autenticado (tras auto-login)
    onSuccess: (user?: UserData) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
    // datos del formulario
    const [formData, setFormData] = useState<UserData>({
        rut: '', nombre: '', fecha_nac: '', correo: '', nombre_usu: '', password: ''
    });
    const [adminToken, setAdminToken] = useState('');
    // mensaje de error
    const [error, setError] = useState('');
    // mensaje de éxito
    const [success, setSuccess] = useState('');
    // mostrar/ocultar contraseña (toggle ojo)
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    // manejar cambios en inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.id === 'rut') {
            value = value.replace(/[^0-9Kk]/g, '').toUpperCase();
            if (value.length > 1) {
                const body = value.slice(0, -1);
                const dv = value.slice(-1);
                value = body + (body ? '-' : '') + dv;
            }
        }
        setFormData({ ...formData, [e.target.id]: value });
        // limpiar error al editar
        setError(''); 
    };

    const handleAdminTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminToken(e.target.value);
        setError('');
    };

    // Manejo del submit del registro: validaciones y llamada al backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. validaciones básicas
        if (!validarRut(formData.rut)) return setError('RUT inválido. Formato: 12345678-K');
        if (!formData.nombre.trim()) return setError('Ingresa tu nombre.');
        if (!validarEdad(formData.fecha_nac)) return setError('Debes ser mayor de 18 años.');
        if (!validarCorreo(formData.correo)) return setError('Correo inválido.');
        if (!formData.nombre_usu.trim()) return setError('Ingresa un nombre de usuario.');
        if (!validarPassword(formData.password)) return setError('Contraseña debe tener al menos 6 caracteres.');

        // 2 Si el correo es @asfaltofashion.cl, exigir token de admin para marcar isAdmin
        let isAdminFlag = false;
        try {
            const domain = formData.correo.split('@')[1] || '';
            if (domain.toLowerCase() === 'asfaltofashion.cl') {
                if (!adminToken.trim()) return setError('Debes ingresar el token de administrador para correos @asfaltofashion.cl');
                if (!isValidAdminToken(adminToken.trim())) return setError('Token inválido.');
                isAdminFlag = true;
            }
        } catch (e) {
            // ignorar errores
        }

        // 3. enviar al backend
        const payload: any = {
            rut: formData.rut,
            nombre: formData.nombre,
            fechaNac: formData.fecha_nac,
            correo: formData.correo,
            nombreUsuario: formData.nombre_usu,
            password: formData.password,
        };
        if (isAdminFlag && adminToken.trim()) payload.adminToken = adminToken.trim();

        try {
            const res = await fetch('http://localhost:8081/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const text = await res.text();
            if (!res.ok) {
                setError(typeof text === 'string' ? text : 'Error en registro');
                return;
            }

            // al registrarse correctamente, intentar login automático
            setSuccess('Registro exitoso. Iniciando sesión...');
            const loginRes = await fetch('http://localhost:8081/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: payload.nombreUsuario, password: payload.password }),
            });
            if (!loginRes.ok) {
                // redirigir a login si no se pudo autenticar automáticamente
                setSuccess('Registro correcto. Por favor inicia sesión.');
                setTimeout(() => onSuccess(), 1500);
                return;
            }
            const loginJson = await loginRes.json();
            // loginJson expected: { token, username, isAdmin, createdAt }
            const token = loginJson.token;
            const username = loginJson.username || payload.nombreUsuario;
            const isAdmin = !!loginJson.isAdmin;
            const createdAt = loginJson.createdAt || '';

            // guardar token y user mínimo en localStorage (incluye createdAt)
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: username, correo: payload.correo, isAdmin, createdAt }));
            // Notificar a la app que cambió el usuario autenticado (para actualizar NavBar sin recargar)
            try { window.dispatchEvent(new Event('asfalto_auth_updated')); } catch (e) { /* noop */ }

            const userAny = { rut: payload.rut, nombre: payload.nombre, fecha_nac: payload.fechaNac, correo: payload.correo, nombre_usu: username, password: '', createdAt } as any;
            onSuccess(userAny);
        } catch (err: any) {
            setError(err?.message || 'Error conectando al servidor');
        }
    };

    return (
        <form id="registerForm" onSubmit={handleSubmit} noValidate>
            <h2>Regístrate</h2>

            <div className="form-body">
            <label className="field">
                <input type="text" id="rut" placeholder="RUT (ej: 12345678-k)" value={formData.rut} onChange={handleChange} />
            </label>
            <label className="field">
                <input type="text" id="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} />
            </label>
            
            <label htmlFor="fecha_nac" style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>Fecha de Nacimiento</label>
            <label className="field">
                <input type="date" id="fecha_nac" value={formData.fecha_nac} onChange={handleChange} />
            </label>
            
            <label className="field">
                <input type="text" id="correo" placeholder="Correo electrónico" value={formData.correo} onChange={handleChange} />
            </label>
            {/* Si el correo es del dominio asfaltofashion.cl, pedir token de admin */}
            {formData.correo.toLowerCase().endsWith('@asfaltofashion.cl') ? (
                <label className="field">
                    <input type="password" id="adminToken" placeholder="Token de administrador" value={adminToken} onChange={handleAdminTokenChange} />
                </label>
            ) : null}
            <label className="field">
                <input type="text" id="nombre_usu" placeholder="Nombre de usuario" value={formData.nombre_usu} onChange={handleChange} />
            </label>
            <label className="field password-field">
                <div className="password-inner">
                    <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Contraseña (mín. 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
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
                {error && <span className="field-error">{error}</span>}
                {success && <span className="field-success">{success}</span>}
            </div>
            <button type="submit" disabled={!!success} className="btn-primary">Registrar</button>
            <p className="link">¿Ya tienes cuenta? <a onClick={() => onSuccess()}>Inicia sesión</a></p>
        </form>
    );
};

export default RegisterForm;