"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

type ScrollToTopProps = {
  /** When to reveal the button:
   *  - "scrolled" (default): after scrolling `threshold` px down from the top.
   *    Stays visible while scrolled — suits long / infinite lists (home page).
   *  - "near-bottom": once the viewport is within `threshold` px of the page
   *    bottom — cues "you've reached the end" on a finite page (detail page). */
  reveal?: "scrolled" | "near-bottom";
  /** Px threshold for the active reveal mode. Defaults to 600 for "scrolled"
   *  and 300 for "near-bottom". */
  threshold?: number;
};

export function ScrollToTop({ reveal = "scrolled", threshold }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const distance = threshold ?? (reveal === "near-bottom" ? 300 : 600);
    const onScroll = () => {
      const show =
        reveal === "near-bottom"
          ? window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - distance
          : window.scrollY > distance;
      setVisible(show && window.scrollY > 0);
    };

    onScroll(); // sync on mount (handles a restored scroll position)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reveal, threshold]);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 right-6 z-20 rounded-full border border-border bg-card p-3 text-muted-foreground shadow-sm transition duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:translate-y-0 ${
        visible
          ? "cursor-pointer translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
