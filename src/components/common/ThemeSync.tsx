"use client";

import { useEffect } from "react";

// Syncs the `.dark` class on <html> to the device theme. The inline script in
// the root layout sets the initial class before paint (no flash); this keeps it
// in sync with live OS theme changes.
export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return null;
}
