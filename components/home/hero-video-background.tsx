"use client";

import { useEffect, useState } from "react";

export function HeroVideoBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    const evaluate = () => {
      if (!mediaQuery.matches) {
        setEnabled(false);
        return;
      }

      if (connection?.saveData) {
        setEnabled(false);
        return;
      }

      const networkType = connection?.effectiveType ?? "";
      setEnabled(networkType !== "2g" && networkType !== "slow-2g");
    };

    evaluate();
    mediaQuery.addEventListener("change", evaluate);

    return () => {
      mediaQuery.removeEventListener("change", evaluate);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div className="hero-video-bg" aria-hidden="true">
      <video autoPlay muted loop playsInline preload="metadata">
        <source src="/assets/videos/garci-hero-background.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
