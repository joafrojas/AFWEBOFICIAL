import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="asfalto-footer" role="contentinfo">
            <div className="footer-inner">
                <div className="footer-left">
                    <a href="/" className="footer-logo-link" aria-label="Ir al inicio">
                        <img src="/IMG/asfaltofashion.png" alt="ASFALTOFASHION" className="footer-logo-img" />
                    </a>
                    <p className="muted">Curaduría de moda urbana — contacto y prensa</p>
                </div>

                <div className="footer-right">
                    <div className="footer-contact-card">
                        <small className="muted">Contacto</small>
                        <div className="contact-lines">
                            <div>Email: <a href="mailto:contacto@asfaltofashion.example">contacto@asfaltofashion.example</a></div>
                            <div>Tel: <a href="tel:+56912345678">+56 9 1234 5678</a></div>
                            <div>Instagram: <a href="https://instagram.com/joandoprivadamente" target="_blank" rel="noopener noreferrer">@joandoprivadamente</a>, <a href="https://instagram.com/frvvn.jrr" target="_blank" rel="noopener noreferrer">@frvvn.jrr</a></div>
                        </div>
                    </div>
                    <div className="footer-copy muted">© {year} AsfaltoFashion</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
