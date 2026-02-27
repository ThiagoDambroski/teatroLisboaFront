import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../scss/Navbar.scss";

type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Home", href: "#/" },
  { label: "Peças", href: "#movies" },
  { label: "Sobre Cinema Teatral OTL", href: "#aboutUs" },
];

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M10.5 3a7.5 7.5 0 1 0 4.58 13.42l4.5 4.5a1 1 0 0 0 1.41-1.41l-4.5-4.5A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 12c2.76 0 5-2.46 5-5.5S14.76 1 12 1 7 3.46 7 6.5 9.24 12 12 12Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function getActiveHash(): string {
  const h = window.location.hash?.trim();
  if (!h || h === "#") return "#home";
  return h;
}

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeHash, setActiveHash] = useState<string>(() => getActiveHash());

  useEffect(() => {
    const onHashChange = (): void => setActiveHash(getActiveHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const nav = useMemo(() => NAV, []);

  const onUserClick = (): void => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(isAdmin ? "/admin" : "/dashboard");
  };

  return (
    <header className="tl-navbar" role="banner">
      <div className="tl-navbar__bg" aria-hidden="true" />

      <nav className="tl-navbar__content" aria-label="Primary navigation">
        <a
          className="tl-navbar__brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          Cinema Teatral OTL<br/>
          <span>Plataforma digital de teatro filmado com linguagem cinematográfica</span>


        </a>

        <div className="tl-navbar__pill">
          {nav.map((item) => (
            <a
              key={item.label}
              className={`tl-navbar__link ${activeHash === item.href ? "is-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="tl-navbar__actions" aria-label="Actions">
          <button
            className="tl-navbar__iconBtn"
            type="button"
            aria-label="Pesquisar"
            onClick={() => navigate("/search")}
          >
            <IconSearch className="tl-navbar__icon" />
          </button>

          <button
            className="tl-navbar__iconBtn"
            type="button"
            aria-label="Conta"
            onClick={onUserClick}
          >
            <IconUser className="tl-navbar__icon" />
          </button>
        </div>
      </nav>
    </header>
  );
}
