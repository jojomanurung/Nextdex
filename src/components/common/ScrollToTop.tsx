"use client";

import { useEffect, useState } from "react";

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

export function ScrollToTop({
  reveal = "scrolled",
  threshold,
}: ScrollToTopProps) {
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

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 right-6 z-20 rounded-full border border-white/10 bg-slate-900/50 p-3 text-zinc-300 backdrop-blur-md transition duration-300 ${
        visible
          ? "translate-y-0 opacity-80"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp />
    </button>
  );
}

function ArrowUp() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-5 w-5"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
