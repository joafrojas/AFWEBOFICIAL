// Utilidades de validación y helpers de usuario (cliente).
// Contiene validadores, funciones para manejar usuarios en localStorage
// y el token de administrador usado en el frontend de demostración.

export interface UserData {
    rut: string;
    nombre: string;
    fecha_nac: string;
    correo: string;
    nombre_usu: string;
    password: string;
    createdAt?: string;
}
// permitimos un flag opcional `isAdmin` para marcar administradores
export interface UserDataWithAdmin extends UserData { isAdmin?: boolean }

export const validarRut = (rut: string): boolean => { 
    return /^\d{7,8}-[\dKk]$/.test(rut); 
};

export const validarCorreo = (email: string): boolean => { 
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 
};

export const validarPassword = (pass: string): boolean => { 
    return pass.length >= 6; 
};

export const validarEdad = (fecha: string): boolean => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    if (isNaN(nacimiento.getTime())) return false;
    
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const ajuste = (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) ? 1 : 0;
    
    return (edad - ajuste) >= 18;
};

const USER_STORAGE_KEY = 'users';

export const getUsers = (): UserData[] => {
    try {
        const usersJson = localStorage.getItem(USER_STORAGE_KEY);
        if (!usersJson) return [];
        const parsed = JSON.parse(usersJson) as UserData[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        // Si hay un error al parsear, devolver una lista vacía en vez de
        // crear automáticamente usuarios.
        return [];
    }
};

export const saveUser = (newUser: UserData): void => {
    const users = getUsers();
    // Asegurar createdAt para usuarios guardados localmente
    if (!newUser.createdAt) newUser.createdAt = new Date().toISOString();
    users.push(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('asfalto_users_updated')); 
};

// Guardar lista completa de usuarios (útil para admin que modifica roles)
export const saveUsers = (nextUsers: UserData[]): void => {
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUsers));
        window.dispatchEvent(new Event('asfalto_users_updated'));
    } catch (e) {
        // ignorar errores
    }
};

// Función para obtener el usuario activo
export const getActiveUser = (): UserDataWithAdmin | null => {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    
    try {
        const partialUser = JSON.parse(userJson) as Partial<UserDataWithAdmin>;
        const users = getUsers();
        // Buscar el usuario completo en la base de datos (localStorage)
        const found = users.find(u => u.nombre_usu === partialUser.nombre_usu) as UserDataWithAdmin | undefined;
        if (found) return found;
        // Si no está en la lista local, devolver el currentUser parcial (útil cuando
        // la app usa un backend para persistir usuarios en lugar de localStorage)
        if (partialUser && partialUser.nombre_usu) {
            return {
                rut: partialUser.rut || '',
                nombre: partialUser.nombre || '',
                fecha_nac: (partialUser as any).fecha_nac || '',
                correo: partialUser.correo || '',
                nombre_usu: partialUser.nombre_usu || '',
                password: '',
                createdAt: (partialUser as any).createdAt || '',
                // preservar el flag isAdmin si viene en el currentUser parcial
                isAdmin: (partialUser as any).isAdmin === true,
            };
        }
        return null;
    } catch {
        return null;
    }
}

// --- Helpers para manejar posts, likes y comentarios ---
const POSTS_KEY = 'asfalto_posts';

export const getPosts = (): any[] => {
    try {
        const raw = localStorage.getItem(POSTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

export const savePosts = (posts: any[]): void => {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        window.dispatchEvent(new Event('asfalto_posts_updated'));
    } catch (e) {
        // ignorar errores
    }
};

export const addCommentToPost = (postId: string, comment: { id: string; user: string; text: string; date: string }) => {
    const posts = getPosts();
    const next = posts.map(p => {
        if (p.id !== postId) return p;
        const comments = Array.isArray(p.comments) ? [...p.comments, comment] : [comment];
        return { ...p, comments };
    });
    savePosts(next);
};

export const toggleLikeOnPost = (postId: string, userName: string) => {
    const posts = getPosts();
    const next = posts.map(p => {
        if (p.id !== postId) return p;
        const likes: string[] = Array.isArray(p.likes) ? [...p.likes] : [];
        const idx = likes.indexOf(userName);
        if (idx >= 0) likes.splice(idx, 1); else likes.push(userName);
        return { ...p, likes };
    });
    savePosts(next);
};


export const ADMIN_TOKEN = 'ASFALTO-ADMIN-2025';

export const isValidAdminToken = (token: string) => token === ADMIN_TOKEN;