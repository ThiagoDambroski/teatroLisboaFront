import "../scss/AboutUsIntro.css";
import imageUrl from "../assets/about-us.jpeg";

export default function AboutUsIntro() {
  const src =
    imageUrl ??
    "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=70";

  return (
    <section className="aboutIntro" aria-label="About us intro">
      <div className="aboutIntro__inner">
        <div className="aboutIntro__hero">
          <div className="aboutIntro__imageWrap">
            <img
              className="aboutIntro__image"
              src={src}
              alt="About us"
            />
            <div
              className="aboutIntro__imageOverlay"
              aria-hidden="true"
            />
          </div>

          <h1 className="aboutIntro__title">about us</h1>
        </div>
      </div>
    </section>
  );
}