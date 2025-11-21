import React, { useState } from 'react';
import '../../styles/FFXIV.css';
import NavBar from '../NavBar';

const IMGS = [
    '/IMG/ffxlv1.jpg',
    '/IMG/ffxlv2.webp',
    '/IMG/ffxlv3.webp',
    '/IMG/ffxlv4.webp',
    '/IMG/Louis-Vuitton-Final-Fantasy-Lightning-Square-Enix-2.webp'
];

const PaginaFFXIV: React.FC = () => {
    const [heroSrc, setHeroSrc] = useState<string>(IMGS[0]);

    return (
        <>
            <NavBar onLogout={() => { window.location.href = '/'; }} />
            <main className="ffxiv-page">

            <header className="ffxiv-header">
                <h1>Louis Vuitton x Final Fantasy</h1>
                <p className="ffxiv-sub">Colaboración oficial: moda de lujo encuentra al mundo de Eorzea — noticias y colecciones.</p>
            </header>

            <section className="ffxiv-hero">
                <img src={heroSrc} alt="Louis Vuitton x Final Fantasy" />
            </section>

            <section className="ffxiv-content">
                <article className="ffxiv-article">
                    <h2>Louis Vuitton colabora con Final Fantasy</h2>
                    <p>La casa de moda Louis Vuitton anuncia una línea inspirada en Final Fantasy, mezclando alta costura con el imaginario del videojuego. La colección incluye prendas, accesorios y piezas de exhibición que celebran los 35 años de la saga.</p>
                    <p>Esta colaboración oficial se ha hecho en conjunto con Square Enix y celebra la intersección entre la moda de lujo y la cultura del gaming. Abajo encontrarás varias imágenes y piezas destacadas de la colección.</p>

                    <div className="ffxiv-gallery">
                        {IMGS.map((src, i) => (
                            <figure
                                key={i}
                                className={`ffxiv-thumb ${src === heroSrc ? 'active' : ''}`}
                                onClick={() => setHeroSrc(src)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHeroSrc(src); }}
                            >
                                <img src={src} alt={`LV x FFXIV ${i + 1}`} />
                                <figcaption>{i === 0 ? 'Colección principal' : `Detalle ${i + 1}`}</figcaption>
                            </figure>
                        ))}
                    </div>
                </article>

                <aside className="ffxiv-collections">
                    <h3>Colecciones relacionadas</h3>
                    <ul>
                        <li>LV x FFXIV - Runaway Capsule</li>
                        <li>Editorial: Cosplay Couture</li>
                        <li>Perfil: Diseñadores detrás de la collab</li>
                    </ul>
                    <div className="ffxiv-note">
                        <strong>Sobre la colección:</strong>
                        <p>Curada por Louis Vuitton en colaboración con Square Enix, la colección toma referencias directas de los personajes, texturas y paletas de Final Fantasy, reinterpretadas en prendas de pasarela.</p>
                    </div>
                </aside>
            </section>
        </main>
        </>
    );
};

export default PaginaFFXIV;
