import React from 'react';
import NavBar from '../NavBar';
import '../../styles/Colecciones.css';

const COLLECTIONS = [
  { id: 'ffxiv', title: 'Louis Vuitton x Final Fantasy', img: '/IMG/ffxlv2.webp', href: '/ffxiv' },
  { id: 'thug', title: 'Young Thug - Desfile', img: '/IMG/yungthug.jpg.jpg', href: '/thug' },
  { id: 'vsa', title: 'VSA Collection', img: '/IMG/galegale.jpg', href: '/vsa' },
];

const PaginaColecciones: React.FC = () => {
  return (
    <>
      <NavBar />
      <main className="colecciones-page">
        <div className="colecciones-container">
          <div className="colecciones-main">
            <header className="colecciones-header">
              <h1>Colecciones</h1>
              <p className="colecciones-sub">Explora colecciones destacadas — selecciona una para ver el detalle.</p>
            </header>

            <section style={{ padding: '0 16px' }}>
              <div className="colecciones-grid">
                {COLLECTIONS.map(c => (
                  <a key={c.id} href={c.href} className="colecciones-thumb" style={{ textDecoration: 'none' }}>
                    <img src={encodeURI(c.img)} alt={c.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ padding: 8, color: '#fff' }}>
                      <strong>{c.title}</strong>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <div className="colecciones-visual" aria-hidden="true">
           
          </div>
        </div>
      </main>
    </>
  );
};

export default PaginaColecciones;
