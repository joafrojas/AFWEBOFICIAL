

import React, { useEffect, useState } from 'react';
import { type UserData } from '../../utils/validation';
import '../../styles/Carga.css';

interface PaginaCargaProps {
    user?: UserData;
    onComplete: () => void; 
}

const REDIRECT_DELAY_MS = 3000; // 3 segundos para el efecto de carga

const PaginaCarga: React.FC<PaginaCargaProps> = ({ user, onComplete }) => {
    const [showLogo, setShowLogo] = useState(true);
    const [mountedAt] = useState(() => Date.now());

    //  Lógica de Redirección (el temporizador de 3 segundos)
    useEffect(() => {
        console.info('[PaginaCarga] mounted at', mountedAt, 'user:', user);
        const timer = setTimeout(() => {
            try { console.info('[PaginaCarga] timeout complete -> calling onComplete'); } catch (e) {}
            onComplete(); // Llama a la función en App.tsx para cambiar la vista
        }, REDIRECT_DELAY_MS);

        return () => {
            clearTimeout(timer);
            try { console.info('[PaginaCarga] unmounted, cleared timeout'); } catch (e) {}
        };
    }, [onComplete, mountedAt, user]);

    const safeUser = user || { rut: '', nombre: '', fecha_nac: '', correo: '', nombre_usu: 'Usuario', password: '', createdAt: '' } as UserData;
    const nombreUsuario = (safeUser as any).nombre_usu || 'Usuario'; 

    // Fallback inline en caso de que los estilos CSS no carguen
    const fallbackStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--site-bg)', color: '#fff', zIndex: 9999999, padding: 20, textAlign: 'center'
    };

    return (
        <div className="contenedorCarga" style={fallbackStyle} data-testid="pagina-carga">
            {showLogo ? (
                <img
                    src="/IMG/asfaltofashion.png"
                    alt="Logo ASFALTOSFASHION"
                    className="logoCarga"
                    onError={() => { setShowLogo(false); console.warn('[PaginaCarga] logo failed to load'); }}
                    style={{ height: 60 }}
                />
            ) : (
                <h1 style={{ color: '#fff', marginBottom: 12 }}>ASFALTO FASHION</h1>
            )}
            
            <p className="mensaje" style={{ color: '#ddd' }}>
                Cargando inicio de sesión…<br/>
                <strong>ESPERE</strong><br/>
                Bienvenido <span id="nombreUsuario">{nombreUsuario}</span>
            </p>
            
            <div className="barraCarga" aria-hidden="true" style={{ marginTop: 16 }}></div>

        </div>
    );
};

export default PaginaCarga;