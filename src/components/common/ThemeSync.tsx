"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Routes migrated to the new light/dark design system. Everything else stays
// dark (its pre-redesign treatment) until it's migrated too. Grow this list as
// pages adopt the new system.
const THEMED_ROUTES = ["/"];

// Syncs the `.dark` class on <html> to the device theme on migrated routes, and
// forces dark elsewhere. The inline script in the root layout sets the initial
// class before paint (no flash); this keeps it in sync across client navigation
// and live OS theme changes.
export function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const themed = THEMED_ROUTES.includes(pathname);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        themed ? mq.matches : true,
      );

    apply();
    if (!themed) return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pathname]);

  return null;
}
