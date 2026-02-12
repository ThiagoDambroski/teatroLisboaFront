import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp, type Category, type Movie } from "../Context/AppProvider"; 
import "../scss/CategorysDisplay.css";

type NavDir = "left" | "right";

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M14.7 6.3a1 1 0 0 1 0 1.4L10.4 12l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function pickCategoryMovies(movies: Movie[]): Movie[] {
  if (movies.length <= 4) return movies;
  return movies.slice(-4); // last 4
}

function getScrollStep(container: HTMLElement): number {
  // scroll roughly one "card width"
  const firstCard = container.querySelector<HTMLElement>("[data-category-card]");
  if (!firstCard) return Math.max(280, container.clientWidth * 0.8);
  const style = window.getComputedStyle(container);
  const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
  return firstCard.offsetWidth + gap;
}

export default function CategorysDisplay() {
  const { categories } = useApp();

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  // If you have few categories, we switch to a responsive grid
  const useGridLayout = useMemo(() => categories.length <= 4, [categories.length]);

  const updateCanScroll = (): void => {
    const el = scrollerRef.current;
    if (!el) return;

    // Only relevant when we use the horizontal scroller layout
    if (useGridLayout) {
      setCanScroll(false);
      return;
    }

    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScroll(hasOverflow);
  };

  useEffect(() => {
    updateCanScroll();

    const handleResize = (): void => updateCanScroll();
    window.addEventListener("resize", handleResize);

    // Watch for content size changes (fonts/images)
    const el = scrollerRef.current;
    const ro = el ? new ResizeObserver(() => updateCanScroll()) : null;
    if (el && ro) ro.observe(el);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (el && ro) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length, useGridLayout]);

  const scroll = (dir: NavDir): void => {
    const el = scrollerRef.current;
    if (!el) return;

    const step = getScrollStep(el);
    const delta = dir === "left" ? -step : step;

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="cats" aria-label="Categories">
      <div className="cats__top">
        <div className="cats__head">
          <h2 className="cats__title">Explore our wide variety of categories</h2>
          <p className="cats__sub">
            Whether you&apos;re looking for a comedy to make you laugh, a drama to make you think,
            or a documentary to learn something new.
          </p>
        </div>

        {/* arrows ONLY appear if there is enough categories (i.e., real overflow) */}
        {!useGridLayout && canScroll && (
          <div className="cats__nav" aria-label="Category navigation">
            <button
              type="button"
              className="cats__navBtn"
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
            >
              <ArrowIcon className="cats__navIcon cats__navIcon--left" />
            </button>

            <div className="cats__navDots" aria-hidden="true">
              <span className="cats__dot is-active" />
              <span className="cats__dot" />
              <span className="cats__dot" />
            </div>

            <button
              type="button"
              className="cats__navBtn"
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
            >
              <ArrowIcon className="cats__navIcon cats__navIcon--right" />
            </button>
          </div>
        )}
      </div>

      {/* Adaptive layout:
          - few categories => grid
          - many categories => horizontal scroller */}
      {useGridLayout ? (
        <div className="cats__grid" role="list">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      ) : (
        <div className="cats__row" ref={scrollerRef} role="list">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const moviesToShow = useMemo(() => pickCategoryMovies(category.movies), [category.movies]);

  const isSingle = moviesToShow.length === 1;

  return (
    <article className="catCard" data-category-card role="listitem">
      <button type="button" className="catCard__btn" aria-label={`Open ${category.name}`}>
        <div className={`catCard__thumb ${isSingle ? "is-single" : "is-grid"}`}>
          {isSingle ? (
            <img
              className="catCard__imgSingle"
              src={moviesToShow[0].posterUrl}
              alt={moviesToShow[0].title}
              loading="lazy"
            />
          ) : (
            <div className="catCard__imgGrid" aria-hidden="true">
              {moviesToShow.map((m) => (
                <img key={m.id} src={m.posterUrl} alt="" loading="lazy" />
              ))}
            </div>
          )}

          {/* soft overlay like screenshot */}
          <div className="catCard__shade" aria-hidden="true" />
        </div>

        <div className="catCard__bottom">
          <span className="catCard__name">{category.name}</span>
          <span className="catCard__arrow" aria-hidden="true">
            →
          </span>
        </div>
      </button>
    </article>
  );
}
