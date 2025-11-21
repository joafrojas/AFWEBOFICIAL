import React from 'react';
import NavBar from '../NavBar';
import '../../styles/Galee.css';

const PaginaGalegale: React.FC = () => {
    return (
        <>
            <NavBar />
            <main className="galee-page">
                <header className="galee-header">
                    <h1>VSA — Colección</h1>
                    <p className="galee-sub">Colección VSA — Galería y presentación.</p>
                </header>

                <section className="galee-hero">
                    <div className="galee-card">
                        <img src="/IMG/galegale.jpg" alt="VSA Collection" />
                        <video src="/IMG/galegale.mp4" controls />
                    </div>
                </section>

                <section style={{ maxWidth: 900, margin: '18px auto', padding: '0 16px', textAlign: 'center' }}>
                    <article className="ffxiv-article" style={{ background: 'transparent', border: 'none' }}>
                        <h2>Sobre VSA</h2>
                        <p>VSA presenta una colección que mezcla influencias urbanas y experimentales. En esta página encontrarás imágenes y el video oficial centrados para una experiencia limpia y ordenada.</p>
                        <p>La galería está centrada — no hay elementos a la derecha ni a la izquierda; el foco está en las piezas y el video.</p>
                    </article>
                </section>
            </main>
        </>
    );
};

export default PaginaGalegale;
