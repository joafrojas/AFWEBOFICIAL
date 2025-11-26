
import { useState, useEffect } from 'react';
import PaginaAuth from './components/Pages/PaginaAuth';
import PaginaCarga from './components/Pages/PaginaCarga';
import PaginaPrincipal from './components/Pages/PaginaPrincipal';
import PaginaFFXIV from './components/Pages/PaginaFFXIV';
import PaginaColecciones from './components/Pages/PaginaColecciones';
import PaginaThug from './components/Pages/PaginaThug';
import PaginaGalegale from './components/Pages/PaginaGalegale';
import PaginaPost from './components/Pages/PaginaPost';
import PaginaContacto from './components/Pages/PaginaContacto';
import PaginaAdmin from './components/Pages/PaginaAdmin';
import Footer from './components/Footer';
import { getActiveUser, type UserData } from './utils/validation';

function App() {
    // Keep behavior simple and compatible with previous working version:
    // - Do NOT attempt to auto-fetch /auth/me or /users/me on mount.
    // - Trust `localStorage.currentUser` via `getActiveUser()` as the initial session.
    const [currentUser, setCurrentUser] = useState<UserData | null>(getActiveUser());
    const [isAwaitingRedirect, setIsAwaitingRedirect] = useState(false);
    const [path, setPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

    useEffect(() => {
        const onPop = () => setPath(typeof window !== 'undefined' ? window.location.pathname : '/');
        window.addEventListener('popstate', onPop);
        window.addEventListener('asfalto_navigate', onPop as EventListener);
        return () => {
            window.removeEventListener('popstate', onPop);
            window.removeEventListener('asfalto_navigate', onPop as EventListener);
        };
    }, []);

    // Called by LoginForm when credentials are correct.
    const handleLoginSuccess = (user: UserData) => {
        // store the user object and show the loading screen (old behavior)
        try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch (e) {}
        setCurrentUser(user);
        setIsAwaitingRedirect(true);
    };

    const handleCargaComplete = () => {
        setIsAwaitingRedirect(false);
        try {
            if (typeof window !== 'undefined' && window.location.search && new URLSearchParams(window.location.search).get('forceCarga') === '1') {
                window.history.replaceState({}, '', '/');
                try { window.dispatchEvent(new Event('popstate')); } catch (e) {}
            }
        } catch (e) {}
    };

    const handleLogout = () => {
        try { localStorage.removeItem('currentUser'); } catch (e) {}
        setCurrentUser(null);
        if (typeof window !== 'undefined') window.location.href = '/';
    };

    // Render PaginaCarga if requested (keeps the previous behavior)
    if (isAwaitingRedirect) {
        return <PaginaCarga user={currentUser || undefined} onComplete={handleCargaComplete} />;
    }

    let pageElement: any = null;

    if (path === '/') {
        // If there's a forceCarga flag show loader (keeps compatibility with previous flow)
        try {
            if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceCarga') === '1') {
                return <PaginaCarga user={currentUser || undefined} onComplete={handleCargaComplete} />;
            }
        } catch (e) {}

        pageElement = currentUser ? <PaginaPrincipal currentUser={currentUser} onLogout={handleLogout} /> : <PaginaAuth onLoginSuccess={handleLoginSuccess} />;
    } else if (path === '/ffxiv') {
        pageElement = <PaginaFFXIV />;
    } else if (path === '/colecciones') {
        pageElement = <PaginaColecciones />;
    } else if (path === '/thug') {
        pageElement = <PaginaThug />;
    } else if (path === '/vsa' || path === '/galegale') {
        pageElement = <PaginaGalegale />;
    } else if (path === '/contacto') {
        pageElement = <PaginaContacto />;
    } else if (path === '/admin') {
        pageElement = <PaginaAdmin />;
    } else if (path.startsWith('/post/')) {
        pageElement = <PaginaPost />;
    } else if (currentUser) {
        pageElement = <PaginaPrincipal currentUser={currentUser} onLogout={handleLogout} />;
    } else {
        pageElement = <PaginaAuth onLoginSuccess={handleLoginSuccess} />;
    }

    const showFooter = !(pageElement && (pageElement.type === PaginaAuth));

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1 }}>{pageElement}</main>
            {showFooter && <Footer />}
        </div>
    );
}

export default App;