import React from "react";
import { Link } from "react-router-dom";
import "../scss/Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Rodapé">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <h2 className="footer__logo">Teatro Lisboa</h2>
            <p className="footer__description">
              Plataforma digital dedicada à exibição de peças, performances e
              conteúdos culturais exclusivos.
            </p>
          </div>

          {/* Navegação */}
          <div className="footer__column">
            <h3 className="footer__title">Explorar</h3>
            <ul className="footer__list">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/catalogo">Catálogo</Link></li>
              <li><Link to="/trailers">Trailers</Link></li>
              <li><Link to="/precos">Preços</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div className="footer__column">
            <h3 className="footer__title">Institucional</h3>
            <ul className="footer__list">
              <li><Link to="/sobre">Sobre nós</Link></li>
              <li><Link to="/faq">Perguntas frequentes</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
              <li><Link to="/politica">Política de privacidade</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="footer__column">
            <h3 className="footer__title">Contacto</h3>
            <ul className="footer__list footer__list--contact">
              <li>contacto@teatrolisboa.pt</li>
              <li>Lisboa, Portugal</li>
            </ul>

            <div className="footer__social">
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="YouTube">YouTube</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Teatro Lisboa. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
