import React, { useMemo, useRef, useState } from "react";
import { useApp, type Category, type Movie } from "../Context/AppProvider";
import "../scss/CatelogyDisplay.css";

type FilterKey = "categories" | "recent" | "featured";

function clampMoviesForGrid(movies: Movie[]): Movie[] {
  if (movies.length === 0) return [];
  if (movies.length === 1) return [movies[0]];
  if (movies.length >= 4) return movies.slice(-4);
  return movies.slice(0, 4);
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

function audienceFromAgeRating(ageRating: string): string {
  const v = ageRating.trim().toUpperCase();
  if (v === "L") return "Famílias";
  if (v === "M/12") return "Adolescentes";
  if (v === "M/16") return "Jovens adultos";
  if (v === "M/18") return "Adultos";
  return "Geral";
}

function useCanScroll(ref: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = React.useState({ canLeft: false, canRight: false });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setState({ canLeft: el.scrollLeft > 2, canRight: el.scrollLeft < max - 2 });
    };

    update();

    const onScroll = () => update();
    const onResize = () => update();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [ref]);

  return state;
}

function scrollByCard(ref: React.RefObject<HTMLDivElement | null>, dir: -1 | 1): void {
  const el = ref.current;
  if (!el) return;
  const amount = Math.min(560, Math.max(300, Math.floor(el.clientWidth * 0.65)));
  el.scrollBy({ left: dir * amount, behavior: "smooth" });
}

function CatalogyDisplay() {
  const { categories } = useApp();
  const [filter, setFilter] = useState<FilterKey>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const allMovies = useMemo<Movie[]>(() => categories.flatMap((c) => c.movies), [categories]);

  const recentlyAdded = useMemo<Movie[]>(() => {
    return [...allMovies].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [allMovies]);

  const featured = useMemo<Movie[]>(() => {
    const flagged = allMovies.filter((m) => m.isFeatured);
    if (flagged.length > 0) return [...flagged].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return [...allMovies]
      .sort((a, b) => (b.rating - a.rating) || (Date.parse(b.createdAt) - Date.parse(a.createdAt)))
      .slice(0, 12);
  }, [allMovies]);

  const selectedCategory = useMemo<Category | undefined>(() => {
    if (!selectedCategoryId) return undefined;
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  return (
    <section className="catalogyDisplay" id="movies" aria-label="Catálogo">
      <div className="catalogyDisplay__inner">
        <div className="catalogyDisplay__panel">
          <div className="catalogyDisplay__top">
            <div className="catalogyDisplay__titleWrap">
              <span className="catalogyDisplay__badge">Peças</span>
              <h2 className="catalogyDisplay__title">Explorar</h2>
              <p className="catalogyDisplay__sub">
                Navegue por categorias, descubra os mais recentes e veja os destaques do Teatro Lisboa.
              </p>
            </div>

            {!selectedCategoryId && (
              <div className="catalogyDisplay__filters" role="tablist" aria-label="Filtros do catálogo">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === "categories"}
                  className={`catalogyDisplay__filterBtn ${filter === "categories" ? "is-active" : ""}`}
                  onClick={() => setFilter("categories")}
                >
                  Categorias
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === "recent"}
                  className={`catalogyDisplay__filterBtn ${filter === "recent" ? "is-active" : ""}`}
                  onClick={() => setFilter("recent")}
                >
                  Adicionados recentemente
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === "featured"}
                  className={`catalogyDisplay__filterBtn ${filter === "featured" ? "is-active" : ""}`}
                  onClick={() => setFilter("featured")}
                >
                  Destaques
                </button>
              </div>
            )}

            {selectedCategoryId && (
              <div className="catalogyDisplay__filters" aria-label="Categoria selecionada">
                <button
                  type="button"
                  className="catalogyDisplay__filterBtn is-active"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  ← Voltar
                </button>

                <div className="catalogyDisplay__selectedTitle" title={selectedCategory?.name ?? ""}>
                  {selectedCategory?.name ?? ""}
                </div>

                <div className="catalogyDisplay__selectedSub">
                  {selectedCategory ? `${selectedCategory.movies.length} peças` : ""}
                </div>
              </div>
            )}
          </div>

          <div className="catalogyDisplay__content">
            {selectedCategoryId ? (
              <MoviesRow
                title={selectedCategory?.name ?? "Categoria"}
                movies={selectedCategory?.movies ?? []}
              />
            ) : (
              <>
                {filter === "categories" && (
                  <CategoriesRow
                    title="Categorias"
                    categories={categories}
                    onSelectCategory={(id) => setSelectedCategoryId(id)}
                  />
                )}

                {filter === "recent" && (
                  <MoviesRow
                    title="Adicionados recentemente"
                    movies={recentlyAdded}
                    tag="Recente"
                  />
                )}

                {filter === "featured" && (
                  <MoviesRow
                    title="Destaques"
                    movies={featured}
                    tag="Destaque"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesRow({
  title,
  categories,
  onSelectCategory,
}: {
  title: string;
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { canLeft, canRight } = useCanScroll(trackRef);

  return (
    <div className="catalogRow">
      <div className="catalogRow__head">
        <h3 className="catalogRow__headTitle">{title}</h3>

        {(canLeft || canRight) && (
          <div className="catalogRow__nav" aria-label="Navegação">
            <button
              type="button"
              className="catalogRow__navBtn"
              onClick={() => scrollByCard(trackRef, -1)}
              disabled={!canLeft}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="catalogRow__navBtn"
              onClick={() => scrollByCard(trackRef, 1)}
              disabled={!canRight}
              aria-label="Seguinte"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="catalogTrack" ref={trackRef}>
        {categories.map((c) => {
          const tiles = clampMoviesForGrid(c.movies);
          return (
            <button
              key={c.id}
              type="button"
              className="categoryCard categoryCard--btn"
              onClick={() => onSelectCategory(c.id)}
              aria-label={`Abrir categoria ${c.name}`}
            >
              <div className="categoryCard__grid" aria-hidden="true">
                {tiles.map((m) => (
                  <img key={m.id} src={m.posterUrl} alt="" loading="lazy" />
                ))}
              </div>

              <div className="categoryCard__bottom">
                <div className="categoryCard__name">{c.name}</div>
                <span className="categoryCard__arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MoviesRow({ title, movies, tag }: { title: string; movies: Movie[]; tag?: string }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { canLeft, canRight } = useCanScroll(trackRef);

  const sliced = useMemo(() => movies.slice(0, 60), [movies]);

  return (
    <div className="catalogRow">
      <div className="catalogRow__head">
        <h3 className="catalogRow__headTitle">{title}</h3>

        {(canLeft || canRight) && (
          <div className="catalogRow__nav" aria-label="Navegação">
            <button
              type="button"
              className="catalogRow__navBtn"
              onClick={() => scrollByCard(trackRef, -1)}
              disabled={!canLeft}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="catalogRow__navBtn"
              onClick={() => scrollByCard(trackRef, 1)}
              disabled={!canRight}
              aria-label="Seguinte"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="catalogTrack catalogTrack--posters" ref={trackRef}>
        {sliced.map((m) => (
          <article key={m.id} className="posterCard">
            <div className="posterCard__img">
              <img src={m.posterUrl} alt={m.title} loading="lazy" />
              {tag ? <span className="posterCard__tag">{tag}</span> : null}
            </div>

            <div className="posterCard__meta">
              <div className="posterCard__title" title={m.title}>
                {m.title}
              </div>

              <div className="posterCard__pills">
                <span className="posterCard__pill">{formatDuration(m.durationMin)}</span>
                <span className="posterCard__pill">Classificação {m.ageRating}</span>
                <span className="posterCard__pill">{audienceFromAgeRating(m.ageRating)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default CatalogyDisplay;
