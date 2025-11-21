import React from 'react';
import NavBar from '../NavBar';
import '../../styles/Thug.css';

const PaginaThug: React.FC = () => {
    return (
        <>
            <NavBar />
            <main className="thug-page">
                <header className="thug-header" style={{ textAlign: 'center' }}>
                    <h1>Young Thug - Desfile</h1>
                    <p className="ffxiv-sub">Cobertura del desfile y material multimedia.</p>
                </header>

                <section className="ffxiv-hero thug-hero">
                    <div className="thug-card">
                        <img src={encodeURI('/IMG/yun tug.jpg')} alt="Young Thug - Look" />
                        <video src={encodeURI('/IMG/desfilethug.mp4')} controls />
                    </div>
                </section>

                <section className="thug-article">
                    <article className="ffxiv-article" style={{ background: 'transparent', border: 'none' }}>
                        <h2>Momento relevante</h2>
                        <p>Durante el desfile hubo un momento que los asistentes recordarán: un modelo tropezó ligeramente en pasarela y el equipo improvisó; se detuvieron brevemente para arreglarle el cuello de la chaqueta antes de que siguiera. Ese gesto de cuidado en plena pasarela fue comentado por críticos y público, y convirtió al desfile en un momento relevante dentro de la temporada.</p>
                        <p>Este material recoge el backstage y la presentación completa. Puedes ver el video arriba y explorar la galería relacionada.</p>
                    </article>
                </section>
            </main>
        </>
    );
};

export default PaginaThug;
