import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, type Movie } from "../Context/AppProvider";
import "../scss/CatalogyIntro.css";

function formatText(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function CatalogyIntro() {
  const { categories } = useApp();
  const navigate = useNavigate();

  const movies = useMemo<Movie[]>(() => {
    return categories.flatMap((c) => c.movies);
  }, [categories]);

  const featured = useMemo<Movie[]>(() => {
    return movies.slice(0, Math.min(6, movies.length));
  }, [movies]);

  const [index, setIndex] = useState<number>(0);

  const current = featured[index];

  const goPrev = (): void => {
    setIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const goNext = (): void => {
    setIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
  };

  if (!current) return null;

  return (
    <section className="catalogIntro">
      <div className="catalogIntro__card">
        <img src={current.posterUrl} alt={current.title} className="catalogIntro__image" />

        <div className="catalogIntro__overlay" />

        <div className="catalogIntro__content">
          <h2>{current.title}</h2>
          <p>{formatText(current.description, 180)}</p>

          <button
            type="button"
            className="catalogIntro__cta"
            onClick={() => navigate(`/movies/${current.id}`)}
          >
            Ver agora
          </button>
        </div>

        {featured.length > 1 && (
          <>
            <button
              type="button"
              className="catalogIntro__nav catalogIntro__nav--left"
              onClick={goPrev}
              aria-label="Anterior"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="catalogIntro__nav catalogIntro__nav--right"
              onClick={goNext}
              aria-label="Seguinte"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="catalogIntro__dots">
              {featured.map((_, i) => (
                <span key={i} className={`catalogIntro__dot ${i === index ? "active" : ""}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default CatalogyIntro;
