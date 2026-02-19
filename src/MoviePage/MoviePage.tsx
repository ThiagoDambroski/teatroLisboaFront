import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp, type Movie } from "../Context/AppProvider";
import "../scss/MoviePage.css";

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;

  if (h <= 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function MoviePage() {
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>();
  const { getMovieById, categories, isAuthenticated } = useApp();

  const movie = useMemo<Movie | undefined>(() => {
    if (!movieId) return undefined;
    return getMovieById(movieId);
  }, [getMovieById, movieId]);

  const categoryNames = useMemo<string[]>(() => {
    if (!movieId) return [];
    return categories
      .filter((c) => c.movies.some((m) => m.id === movieId))
      .map((c) => c.name);
  }, [categories, movieId]);

  const goBack = (): void => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/movies", { replace: true });
  };

  const handleWatchNow = (): void => {
    if (!movieId) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/movies/${movieId}` } });
      return;
    }

    navigate(`/watch/${movieId}`);
  };

  if (!movie) {
    return (
      <main className="moviePage">
        <div className="moviePage__shell">
          <div className="moviePage__notFound">
            <h1>Peça não encontrada</h1>
            <button type="button" className="moviePage__back" onClick={goBack}>
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="moviePage" aria-label={`Página da peça ${movie.title}`}>
      <div className="moviePage__shell">
        <section className="movieHero">
          <div className="movieHero__media">
            <img className="movieHero__img" src={movie.posterUrl} alt={movie.title} />
            <div className="movieHero__overlay" />
          </div>

          <div className="movieHero__content">
            <div className="movieHero__kicker">trailer</div>
            <h1 className="movieHero__title">{movie.title}</h1>
            <p className="movieHero__desc">{movie.description}</p>

            <div className="movieHero__meta">
              <span className="movieHero__pill">{formatDuration(movie.durationMin)}</span>
              <span className="movieHero__pill">Classificação {movie.ageRating}</span>
              <span className="movieHero__pill">{movie.year}</span>
              <span className="movieHero__pill movieHero__pill--price">{formatEUR(movie.price)}</span>
            </div>

            <div className="movieHero__actions">
              <button type="button" className="movieHero__play" onClick={handleWatchNow}>
                Ver agora
              </button>

              <button type="button" className="movieHero__ghost" onClick={goBack}>
                Voltar
              </button>
            </div>
          </div>
        </section>

        <section className="movieLayout" aria-label="Detalhes da peça">
          <div className="movieLayout__main">
            <div className="movieBlock">
              <div className="movieBlock__head">
                <h2 className="movieBlock__title">Descrição</h2>
              </div>
              <div className="movieBlock__body">
                <p className="movieBlock__text">{movie.description}</p>
              </div>
            </div>

            <div className="movieBlock">
              <div className="movieBlock__head">
                <h2 className="movieBlock__title">Elenco & Equipa</h2>
              </div>

              <div className="movieBlock__body">
                <div className="castRow" aria-label="Colaboradores">
                  {movie.collaborators.map((p) => (
                    <a
                      key={p.id}
                      className="castCard"
                      href={p.socialUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${p.name} - ${p.functionOnMovie}`}
                      title={`${p.name} — ${p.functionOnMovie}`}
                    >
                      <img className="castCard__img" src={p.photoUrl} alt={p.name} />
                      <div className="castCard__meta">
                        <div className="castCard__name">{p.name}</div>
                        <div className="castCard__role">{p.functionOnMovie}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="movieLayout__aside" aria-label="Informações">
            <div className="asideCard">
              <h3 className="asideCard__title">Informações</h3>

              <div className="asideCard__item">
                <div className="asideCard__label">Ano</div>
                <div className="asideCard__value">{movie.year}</div>
              </div>

              <div className="asideCard__item">
                <div className="asideCard__label">Categoria</div>
                <div className="asideCard__value">
                  {categoryNames.length ? categoryNames.join(", ") : "—"}
                </div>
              </div>

              <div className="asideCard__item">
                <div className="asideCard__label">Preço</div>
                <div className="asideCard__value asideCard__value--price">{formatEUR(movie.price)}</div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default MoviePage;
