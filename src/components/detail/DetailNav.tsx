const SECTIONS = [
  { id: "about", label: "About" },
  { id: "stats", label: "Stats" },
  { id: "abilities", label: "Abilities" },
  { id: "matchups", label: "Matchups" },
  { id: "evolution", label: "Evolution" },
];

// Sticky in-page sub-nav. Docks right under the (shrinking) Navbar via the
// shared --navbar-height CSS variable, same as the list page's ControlDeck.
export function DetailNav() {
  return (
    <nav
      className="sticky z-20 mx-auto flex w-fit max-w-full flex-wrap justify-center rounded-2xl border border-white/10 bg-slate-900/50 p-1 backdrop-blur-md sm:flex-nowrap sm:rounded-full"
      style={{ top: "calc(var(--navbar-height, 96px) + 0.5rem)" }}
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
