import { Link } from "react-router-dom";
import "../scss/Footer.scss";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Rodapé">
      <div className="footer__inner">
        <nav className="footer__nav">
          <Link to="/trailers" className="footer__link">Trailers</Link>
          <Link to="/privacidade" className="footer__link">Política de Privacidade</Link>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            Instagram
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            Facebook
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            YouTube
          </a>
        </nav>

        <div className="footer__copyright">
          © {year}  OTL Cinema Teatral. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;