import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import '../../styles/FFXIV.css';
import '../../styles/Post.css';
import { getActiveUser } from '../../utils/validation';

/*
    PaginaPost
    - Vista de detalle de una publicación individual.
    - Permite dar like y añadir comentarios dentro de la propia publicación.
    - Los cambios se guardan en localStorage usando los helpers en utils/validation.ts.
*/

// Ahora cargamos la publicación desde el microservicio `foro` en vez de localStorage

const PaginaPost: React.FC = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const id = path.startsWith('/post/') ? path.replace('/post/', '') : '';

    
    

    const [post, setPost] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState('');

    // Cargar la publicación desde el microservicio foro
    useEffect(() => {
        let mounted = true;
        const fetchPost = async () => {
            if (!id) return;
            try {
                const res = await fetch(`http://localhost:8082/api/posts/${id}`);
                if (!res.ok) {
                    setPost(null);
                    return;
                }
                const json = await res.json();
                if (mounted) setPost(json);
            } catch (e) {
                // ignorar errores al cargar la publicación
                setPost(null);
            }
        };
        fetchPost();
        return () => { mounted = false; };
    }, [id]);

    return (
        <>
            <NavBar />
            <main className="ffxiv-page">
                <header className="ffxiv-header">
                    <h1>{post ? post.title : 'Publicación no encontrada'}</h1>
                    {post ? (
                        <p className="ffxiv-sub">
                            {post.category} • Por {post.author || post.authorId} — {post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '')}
                        </p>
                    ) : null}
                </header>

                {post ? (
                    <section className="ffxiv-hero">
                        <img src={post.image} alt={post.title} style={{ maxWidth: 1100, width: '100%', borderRadius: 10 }} />

                        {/* Interacciones: like y comentarios dentro de la publicación */}
                        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button
                                className="btn-like"
                                onClick={async () => {
                                    const user = getActiveUser();
                                    if (!user) return alert('Inicia sesión para dar like.');
                                    try {
                                        const res = await fetch(`http://localhost:8082/api/posts/${post.id}/likes`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(user.nombre_usu),
                                        });
                                        if (!res.ok) return;
                                        const updated = await res.json();
                                        setPost(updated);
                                    } catch (e) {
                                        // ignorar errores al alternar like
                                    }
                                }}
                                aria-pressed={post.likes && getActiveUser() && post.likes.includes(getActiveUser()!.nombre_usu)}
                            >
                                {post.likes && getActiveUser() && post.likes.includes(getActiveUser()!.nombre_usu) ? '♥' : '♡'} {post.likes ? post.likes.length : 0}
                            </button>
                        </div>

                        {/* Comentarios listados debajo de la imagen */}
                        <div style={{ marginTop: 18 }}>
                            <h3 style={{ margin: '6px 0' }}>Comentarios</h3>
                            {post.comments && post.comments.length > 0 ? (
                                <div style={{ marginBottom: 12 }}>
                                    {post.comments.map((c:any) => (
                                        <div key={c.id} className="comment-item">
                                            <div className="comment-avatar">{(c.userId || 'U').slice(0,1).toUpperCase()}</div>
                                            <div className="comment-body">
                                                <div className="comment-meta">
                                                    <strong className="comment-user">{c.userId}</strong>
                                                    <span className="comment-date">{new Date(c.createdAt || c.date).toLocaleString()}</span>
                                                </div>
                                                <div className="comment-text">{c.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999' }}>Aún no hay comentarios — sé el primero.</p>
                            )}

                            {/* Formulario para añadir comentario (textarea + mensaje de error) */}
                            <div className="comment-form-wrap">
                                <div className="comment-input-wrap">
                                    <textarea
                                        value={commentText}
                                        onChange={e => { setCommentText(e.target.value); if (commentError) setCommentError(''); }}
                                        // Mostrar siempre el placeholder esperado por los tests
                                        placeholder={'Escribe tu comentario aquí...'}
                                        rows={3}
                                        className="comment-input"
                                    />
                                </div>
                                <div className="comment-actions-row">
                                    {commentError ? <div className="comment-error">{commentError}</div> : <div />}
                                    <div>
                                        <button
                                            className="btn-primary"
                                            onClick={async () => {
                                                const user = getActiveUser();
                                                if (!user) { alert('Inicia sesión para comentar.'); return; }
                                                const text = (commentText || '').trim();
                                                if (!text) { setCommentError('El comentario debe contener al menos 1 carácter.'); return; }
                                                const payload = { userId: user.nombre_usu, text };
                                                try {
                                                    const res = await fetch(`http://localhost:8082/api/posts/${post.id}/comments`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(payload),
                                                    });
                                                    if (!res.ok) { setCommentError('Error al guardar el comentario. Intenta de nuevo.'); return; }
                                                    // obtener post actualizado
                                                    const updatedRes = await fetch(`http://localhost:8082/api/posts/${post.id}`);
                                                    if (updatedRes.ok) {
                                                        const updated = await updatedRes.json();
                                                        setPost(updated);
                                                    }
                                                    setCommentText('');
                                                    setCommentError('');
                                                } catch (e) {
                                                    setCommentError('Error al guardar el comentario. Intenta de nuevo.');
                                                }
                                            }}
                                        >Comentar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section style={{ textAlign: 'center', padding: 40 }}>
                        <p>No se encontró la publicación solicitada.</p>
                        <a href="/">Volver al inicio</a>
                    </section>
                )}
            </main>
        </>
    );
};

export default PaginaPost;
