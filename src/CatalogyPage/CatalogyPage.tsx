import React, { useEffect, useRef } from 'react'
import CatalogyIntro from './CatalogyIntro';
import CatalogyDisplay from './CatalogyDisplay';
import { useSearchParams } from 'react-router-dom';

export default function CataloyPage() {
  const [searchParams] = useSearchParams();
  const displayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hasCat = !!searchParams.get("cat");
    const hasPrice = !!searchParams.get("price");
    if (!hasCat && !hasPrice) return;

    // small delay so layout is ready
    const t = window.setTimeout(() => {
      displayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => window.clearTimeout(t);
  }, [searchParams]);

  return (
    <main>
       <CatalogyIntro /> 
      <div ref={displayRef}>
        <CatalogyDisplay />
      </div>
    </main>
  );
}