import React from "react";
import "../scss/HomeIntro.css";

function PlayMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true" {...props}>
      {/* Outer ring */}
      <circle
        cx="130"
        cy="130"
        r="96"
        fill="none"
        stroke="currentColor"
        strokeWidth="22"
        opacity="0.28"
      />
      {/* Inner cut ring */}
      <circle
        cx="130"
        cy="130"
        r="58"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        opacity="0.18"
      />
      {/* Play triangle */}
      <path
        d="M116 102 L116 158 L164 130 Z"
        fill="currentColor"
        opacity="0.30"
      />
    </svg>
  );
}

export default function HomeIntro() {
  return (
    <section className="homeIntro" aria-label="Teatro Lisboa introduction">
      {/* One single background image */}
      <div className="homeIntro__bg" aria-hidden="true" />

      {/* Vignette + readability overlays */}
      <div className="homeIntro__overlay" aria-hidden="true" />

      <div className="homeIntro__content">
        <div className="homeIntro__play" aria-hidden="true">
          <PlayMark className="homeIntro__playIcon" />
        </div>

        <h1 className="homeIntro__title">TEATRO LISBOA</h1>

        <p className="homeIntro__text">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. 
          Quod porro atque maxime temporibus! Dolorem nisi quos voluptatum, nesciunt eius eligendi cum,
           perspiciatis, provident tempore vitae ad quis atque officia possimus.
        </p>

        <div className="homeIntro__ctaRow">
          <a className="homeIntro__cta" href="#movies">
            <span className="homeIntro__ctaIcon" aria-hidden="true">
              ▶
            </span>
            <span>Start Watching Now</span>
          </a>
        </div>
      </div>
    </section>
  );
}
