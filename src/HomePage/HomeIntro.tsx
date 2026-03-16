import React, { useMemo, useState } from "react";
import { useApp, type Movie } from "../Context/AppProvider";
import "../scss/HomeIntro.scss";
import introImg from "../assets/background main.jpeg";
import logoImg from "../assets/logo-file.png";

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M14.5 5 8 12l6.5 7" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9.5 5 16 12l-6.5 7" />
    </svg>
  );
}

function formatDuration(durationMin: number): string {
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  return `${hours}h ${minutes}min`;
}

export default function HomeIntro() {
  const { categories } = useApp();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const featuredMovies = useMemo<Movie[]>(() => {
    return categories
      .flatMap((category) => category.movies)
      .filter((movie) => movie.isFeatured);
  }, [categories]);

  const movies =
    featuredMovies.length > 0
      ? featuredMovies
      : categories.flatMap((category) => category.movies);

  const maxIndex = Math.max(0, movies.length);

  const handlePrev = (): void => {
    setCurrentIndex((prev) => {
      if (movies.length === 0) return 0;
      return prev === 0 ? maxIndex : prev - 1;
    });
  };

  const handleNext = (): void => {
    setCurrentIndex((prev) => {
      if (movies.length === 0) return 0;
      return prev === maxIndex ? 0 : prev + 1;
    });
  };

  return (
    <section className="homeIntro" aria-label="Cinema Teatral home intro">
      <img className="homeIntro__bgImage" src={introImg} alt="" />

      <div className="homeIntro__overlay" />

      <div className="homeIntro__container">
        <div className="homeIntro__hero">
          <div className="homeIntro__brandBlock">
            <img
              className="homeIntro__brandMock"
              src={logoImg}
              alt="Cinema Teatral logo"
            />

            <p className="homeIntro__description">
              Plataforma digital de teatro filmado com linguagem cinematográfica.
            </p>
          </div>
        </div>

        <div className="homeIntro__explore">
          <div className="homeIntro__exploreTop">
            <h2 className="homeIntro__sectionTitle">Explorar</h2>

            <div className="homeIntro__controls">
              <button
                type="button"
                className="homeIntro__controlBtn"
                onClick={handlePrev}
                aria-label="Previous movies"
              >
                <ChevronLeft className="homeIntro__controlIcon" />
              </button>

              <button
                type="button"
                className="homeIntro__controlBtn"
                onClick={handleNext}
                aria-label="Next movies"
              >
                <ChevronRight className="homeIntro__controlIcon" />
              </button>
            </div>
          </div>

          <div className="homeIntro__carouselViewport">
            <div
              className="homeIntro__carouselTrack"
              style={{
                transform: `translateX(calc(-${currentIndex} * (clamp(230px, 28vw, 320px) + 18px)))`,
              }}
            >
              {movies.map((movie) => {
                const director = movie.collaborators.find(
                  (collaborator) =>
                    collaborator.functionOnMovie === "Direção"
                )?.name;

                return (
                  <article className="homeIntro__card" key={movie.id}>
                    <div className="homeIntro__cardPosterWrap">
                      <img
                        className="homeIntro__cardPoster"
                        src={movie.posterUrl}
                        alt={movie.title}
                      />
                      <div className="homeIntro__cardOverlay" />
                    </div>

                    <div className="homeIntro__cardMetaTop">
                      <span className="homeIntro__cardBadge">
                        {movie.ageRating}
                      </span>
                      <span className="homeIntro__cardDot" />
                      <span className="homeIntro__cardInfo">
                        {formatDuration(movie.durationMin)}
                      </span>
                    </div>

                    <h3 className="homeIntro__cardTitle">{movie.title}</h3>

                    <p className="homeIntro__cardAuthor">
                      {director ?? "Cinema Teatral"}
                    </p>
                  </article>
                );
              })}

              <article className="homeIntro__card homeIntro__card--soon">
                <div className="homeIntro__cardSoonBg" />
                <div className="homeIntro__cardOverlay" />
                <div className="homeIntro__soonLabel">Em breve</div>
                <h3 className="homeIntro__cardTitle">Eu e Tu Não Somos Nós</h3>
                <p className="homeIntro__cardAuthor">João Rosa</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}