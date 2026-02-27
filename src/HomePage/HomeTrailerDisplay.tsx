import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, type Movie } from "../Context/AppProvider";
import "../scss/HomeTrailerDisplay.css";

type TrailerItem = {
  id: string;
  movieId: string;
  youtubeId: string;
  label: string;
};

function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildYouTubeEmbedUrl(youtubeId: string): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?${params.toString()}`;
}

function findMovieById(movies: Movie[], id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

const MOCK_TRAILERS: TrailerItem[] = [
  { id: "t-01", movieId: "m-016", youtubeId: "M7lc1UVf-VE", label: "Trailer Oficial" },
  { id: "t-02", movieId: "m-017", youtubeId: "ysz5S6PUM-U", label: "Teaser" },
  { id: "t-03", movieId: "m-018", youtubeId: "aqz-KE-bpKQ", label: "Bastidores" },
  { id: "t-04", movieId: "m-019", youtubeId: "ScMzIvxBSi4", label: "Clip" },
  { id: "t-05", movieId: "m-020", youtubeId: "dQw4w9WgXcQ", label: "Trailer Curto" },
];

export default function HomeTrailerDisplay() {
  const navigate = useNavigate();
  const { categories } = useApp();

  const allMovies = useMemo(() => categories.flatMap((c) => c.movies), [categories]);

  const initialTrailerId = MOCK_TRAILERS[0]?.id ?? "";
  const [selectedTrailerId, setSelectedTrailerId] = useState<string>(initialTrailerId);

  const selectedTrailer = useMemo(() => {
    return MOCK_TRAILERS.find((t) => t.id === selectedTrailerId) ?? MOCK_TRAILERS[0];
  }, [selectedTrailerId]);

  const movie = useMemo(() => {
    if (!selectedTrailer) return undefined;
    return findMovieById(allMovies, selectedTrailer.movieId);
  }, [allMovies, selectedTrailer]);

  const embedUrl = useMemo(() => {
    if (!selectedTrailer) return "";
    return buildYouTubeEmbedUrl(selectedTrailer.youtubeId);
  }, [selectedTrailer]);

  const goToMoviePage = (): void => {
    if (!movie) return;
    navigate(`/movies/${movie.id}`);
  };

  return (
    <section className="trailerPage" aria-label="Trailer">
      <div className="trailerPage__inner">
        <div className="trailerTop">
          <div className="trailerTop__left">
            <h1 className="trailerTop__title">Trailer</h1>
            <p className="trailerTop__sub">
              Veja o trailer em destaque e descubra outros conteúdos do Cinema Teatral OTL.
            </p>
          </div>

          <div className="trailerTop__pill" aria-label="Info rápida">
            <span className="trailerTop__pillDot" aria-hidden="true" />
            <span className="trailerTop__pillText">
              {movie ? `Preço: ${formatEUR(movie.price)} por filme` : "Preço: —"}
            </span>
          </div>
        </div>

        <div className="trailerGrid">
          <div className="trailerMain">
            <div className="trailerMain__frame">
              {embedUrl ? (
                <iframe
                  className="trailerMain__iframe"
                  src={embedUrl}
                  title={movie ? `Trailer de ${movie.title}` : "Trailer"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </div>

            <div className="trailerMain__meta">
              <div className="trailerMain__metaLeft">
                <h2 className="trailerMain__movieTitle">{movie?.title ?? "Título indisponível"}</h2>

                <div className="trailerMain__chips">
                  <span className="chip">{movie ? `${movie.year}` : "—"}</span>
                  <span className="chip">{movie ? `${movie.durationMin} min` : "—"}</span>
                  <span className="chip">{movie ? `Classificação ${movie.ageRating}` : "—"}</span>
                  <span className="chip chip--price">{movie ? `${formatEUR(movie.price)} por filme` : "—"}</span>
                </div>

                <p className="trailerMain__desc">{movie?.description ?? "Sem descrição."}</p>
              </div>

              <div className="trailerMain__metaRight">
                <button
                  type="button"
                  className="trailerBtn trailerBtn--primary"
                  onClick={goToMoviePage}
                  disabled={!movie}
                  aria-disabled={!movie}
                >
                  Ver agora
                </button>
              </div>
            </div>
          </div>

          <aside className="trailerSide" aria-label="Mais trailers">
            <div className="trailerSide__head">
              <h3 className="trailerSide__title">Mais trailers</h3>
              <p className="trailerSide__sub">Selecione um para trocar o vídeo.</p>
            </div>

            <div className="trailerSide__list" role="list">
              {MOCK_TRAILERS.map((t) => {
                const m = findMovieById(allMovies, t.movieId);
                const isActive = t.id === selectedTrailerId;

                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`trailerItem ${isActive ? "is-active" : ""}`}
                    onClick={() => setSelectedTrailerId(t.id)}
                    role="listitem"
                    aria-label={`Abrir ${t.label}${m ? `: ${m.title}` : ""}`}
                  >
                    <div className="trailerItem__thumb">
                      {m?.posterUrl ? <img src={m.posterUrl} alt={m.title} loading="lazy" /> : null}
                      <div className="trailerItem__thumbShade" aria-hidden="true" />
                      <div className="trailerItem__play" aria-hidden="true">
                        ▶
                      </div>
                    </div>

                    <div className="trailerItem__info">
                      <div className="trailerItem__row">
                        <span className="trailerItem__label">{t.label}</span>
                        {m ? <span className="trailerItem__price">{formatEUR(m.price)}</span> : null}
                      </div>
                      <div className="trailerItem__name">{m?.title ?? "Indisponível"}</div>
                      <div className="trailerItem__small">
                        {m ? `${m.year} · ${m.durationMin} min · ${m.ageRating}` : "—"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}