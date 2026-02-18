import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp, type Movie } from "../Context/AppProvider";
import "../scss/SearchPage.css";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = useState<string>(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const allMovies = useMemo<Movie[]>(
    () => categories.flatMap((c) => c.movies),
    [categories]
  );

  const results = useMemo<Movie[]>(() => {
    const query = normalize(q);
    if (!query) return [];

    return allMovies
      .filter((m) => normalize(m.title).includes(query))
      .slice(0, 30);
  }, [allMovies, q]);

  return (
    <main className="searchPage" aria-label="Pesquisar peças">
      <div className="searchPage__bg" aria-hidden="true" />

      <div className="searchPage__shell">
        <button type="button" className="searchPage__back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="searchCard">
          <div className="searchCard__head">
            <span className="searchCard__badge">Pesquisa</span>
            <h1 className="searchCard__title">Encontre uma peça</h1>
            <p className="searchCard__sub">Pesquise pelo nome e abra a página do filme.</p>
          </div>

          <div className="searchCard__bar">
            <input
              className="searchCard__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex: Midnight Circuit"
              aria-label="Pesquisar por nome"
              autoFocus
            />
            {q.trim() ? (
              <button type="button" className="searchCard__clear" onClick={() => setQ("")}>
                Limpar
              </button>
            ) : null}
          </div>

          <div className="searchCard__results" role="list">
            {!q.trim() ? (
              <div className="searchEmpty">
                Digite para pesquisar.
              </div>
            ) : results.length === 0 ? (
              <div className="searchEmpty">
                Nenhum resultado para “{q}”.
              </div>
            ) : (
              results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="searchItem"
                  role="listitem"
                  onClick={() => navigate(`/movies/${m.id}`)}
                  aria-label={`Abrir ${m.title}`}
                >
                  <div className="searchItem__img">
                    <img src={m.posterUrl} alt={m.title} loading="lazy" />
                  </div>

                  <div className="searchItem__meta">
                    <div className="searchItem__title">{m.title}</div>
                    <div className="searchItem__small">
                      {m.year} · {m.durationMin} min · {m.ageRating}
                    </div>
                  </div>

                  <div className="searchItem__arrow" aria-hidden="true">→</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
