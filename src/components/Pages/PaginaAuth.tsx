// Página de autenticación: muestra login o register según la vista.
import React, { useState } from 'react';
import * as LoginFormModule from '../Auth/LoginForm';
import * as RegisterFormModule from '../Auth/RegisterForm';
// compat layer: some test/build setups may resolve modules differently
const LoginForm: React.FC<any> = (LoginFormModule as any)?.default || (LoginFormModule as any)?.LoginForm || (() => <div>Login</div>);
const RegisterForm: React.FC<any> = (RegisterFormModule as any)?.default || (RegisterFormModule as any)?.RegisterForm || (() => <div>Register</div>);
import { type UserData } from '../../utils/validation';
import '../../styles/Auth.css';


interface PaginaAuthProps {
    onLoginSuccess: (user: UserData) => void;
}

const PaginaAuth: React.FC<PaginaAuthProps> = ({ onLoginSuccess }) => {
    const [view, setView] = useState<'login' | 'register'>('login');

    const handleLoginSuccess = (user: UserData) => {
        onLoginSuccess(user);
    };

    const handleRegisterSuccess = (user?: UserData) => {
        if (user) {
            onLoginSuccess(user);
        } else {
            setView('login');
        }
    };

    return (
        <div className="contenedorAsfalto">
            
            <div className="ladoImagen">
                 {/* Esta sección solo contiene la imagen de fondo */}
            </div>

            <div className="ladoFormulario">
                
                <div className="topContent">
                    
                    <img src="/IMG/asfaltofashion.png" alt="ASFALTO FASHION Logo" className="logoPrincipal" /> 
                    
                    {/* El bloque de texto editorial */}
                    <div className="editorialTexto">
                      
                        <p>Accede a contenido exclusivo de diseño y recursos acerca fashion de propiedad.</p>
                    </div>
                </div>

                {view === 'login' ? (
                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onSwitchToRegister={() => setView('register')}
                    />
                ) : (
                    <RegisterForm
                        onSuccess={handleRegisterSuccess}
                    />
                )}

                <p className="marca">@asaltofashionistas</p>
            </div>
        </div>
    );
};

export default PaginaAuth;