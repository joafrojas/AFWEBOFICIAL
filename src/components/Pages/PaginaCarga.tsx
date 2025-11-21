

import React, { useEffect } from 'react';
import { type UserData } from '../../utils/validation';
import '../../styles/Carga.css';

interface PaginaCargaProps {
    user: UserData;
    onComplete: () => void; 
}

const REDIRECT_DELAY_MS = 3000; // 3 segundos para el efecto de carga

const PaginaCarga: React.FC<PaginaCargaProps> = ({ user, onComplete }) => {
    
    //  Lógica de Redirección (el temporizador de 3 segundos)
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete(); // Llama a la función en App.tsx para cambiar la vista
        }, REDIRECT_DELAY_MS);

        return () => clearTimeout(timer); 
    }, [onComplete]);

    const nombreUsuario = user.nombre_usu; 

    return (
        <div className="contenedorCarga">
            <img src="/IMG/asfaltofashion.png" alt="Logo ASFALTOSFASHION" className="logoCarga" />
            
            <p className="mensaje">
                Cargando inicio de sesión…<br/>
                <strong>CORRECTO</strong><br/>
                {/* Saludo al usuario */}
                Bienvenido <span id="nombreUsuario">{nombreUsuario}</span>
            </p>
            
            <div className="barraCarga"></div>
        </div>
    );
};

export default PaginaCarga;