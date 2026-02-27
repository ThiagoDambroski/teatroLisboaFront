import React from "react";
import "../scss/HomeIntro.css";
import introVideo from "../assets/Cinema_Teatral OTL.mp4";

function PlayMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true" {...props}>
      <circle cx="130" cy="130" r="96" fill="none" stroke="currentColor" strokeWidth="22" opacity="0.28" />
      <circle cx="130" cy="130" r="58" fill="none" stroke="currentColor" strokeWidth="18" opacity="0.18" />
      <path d="M116 102 L116 158 L164 130 Z" fill="currentColor" opacity="0.30" />
    </svg>
  );
}

export default function HomeIntro() {
  return (
    <section className="homeIntro" aria-label="Introdução do Teatro Lisboa">
      <video
        
        className="homeIntro__video"
        src={introVideo}
        autoPlay
        muted
        playsInline
        preload="metadata"
      />
    </section>
  );
}
