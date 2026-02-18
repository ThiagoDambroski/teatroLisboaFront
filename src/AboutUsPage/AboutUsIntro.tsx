
import "../scss/AboutUsIntro.css";

type AboutUsIntroProps = {
  // optional: pass your own image later
  imageUrl?: string;
};

export default function AboutUsIntro({ imageUrl }: AboutUsIntroProps) {
  const src =
    imageUrl ??
    "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=70";

  return (
    <section className="aboutIntro" aria-label="About us intro">
      <div className="aboutIntro__frame">
        <div className="aboutIntro__imgWrap">
          <img className="aboutIntro__img" src={src} alt="About us" />
          <div className="aboutIntro__imgOverlay" aria-hidden="true" />
        </div>

        <h1 className="aboutIntro__title">about us</h1>
      </div>
    </section>
  );
}
