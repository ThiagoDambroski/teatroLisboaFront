import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../Context/AppProvider";
import "../scss/HomePrices.css";

type PriceGroup = {
  price: number;
  count: number;
};

function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomePrices() {
  const { categories } = useApp();
  const navigate = useNavigate();

  const priceGroups = useMemo<PriceGroup[]>(() => {
    const movies = categories.flatMap((c) => c.movies);

    const map = new Map<number, number>();
    for (const m of movies) {
      map.set(m.price, (map.get(m.price) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([price, count]) => ({ price, count }))
      .sort((a, b) => a.price - b.price);
  }, [categories]);

  const totalMovies = useMemo(
    () => categories.reduce((acc, c) => acc + c.movies.length, 0),
    [categories]
  );

  const goToPrice = (price: number): void => {
    navigate(`/movies?price=${encodeURIComponent(String(price))}`);
  };

  return (
    <section className="prices" aria-label="Preços">
      <div className="prices__inner">
        <div className="prices__top">
          <div>
            <h2 className="prices__title">Nossos preços</h2>
            <p className="prices__sub">
              Os preços abaixo são gerados automaticamente com base nos valores definidos para cada peça.
              Atualmente, há {totalMovies} peças na plataforma.
            </p>
          </div>
        </div>

        <div className="prices__grid" role="list">
          {priceGroups.map((g) => (
            <article key={g.price} className="priceCard" role="listitem">
              <div className="priceCard__head">
                <h3 className="priceCard__name">Peças de {formatEUR(g.price)}</h3>
                <div className="priceCard__meta">
                  <span>{g.count} {g.count === 1 ? "peça" : "peças"}</span>
                </div>
              </div>

              <div className="priceCard__priceRow">
                <div className="priceCard__price">{formatEUR(g.price)}</div>
                <div className="priceCard__unit">por peça</div>
              </div>

              <button
                type="button"
                className="priceCard__btn"
                onClick={() => goToPrice(g.price)}
                aria-label={`Ver peças de ${formatEUR(g.price)}`}
              >
                Escolher
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
