"use client";

import { useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";

import { StrokeCanvas } from "@/components/stroke-canvas";

type Site = typeof import("@/data/site.json");

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("theme-change", onChange);
  return () => window.removeEventListener("theme-change", onChange);
}

function getTheme() {
  return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

function updateTheme(theme: "light" | "dark") {
  window.localStorage.setItem("theme", theme);
  window.dispatchEvent(new Event("theme-change"));
}

const navigation = [
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export function Portfolio({ site }: { site: Site }) {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light" as const);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <div className="page-surface relative min-h-screen overflow-x-clip">
        <div className="hero-stroke" aria-hidden />
        <StrokeCanvas />
        <header className="sticky top-0 z-20 border-b border-(--line) bg-(--surface)/90 backdrop-blur-md">
          <div className="mx-auto flex h-20 w-[min(1080px,calc(100%-2.5rem))] items-center justify-between">
            <a href="#top" className="text-base font-medium" onClick={closeMenu}>
              {site.person.name}
            </a>
            <nav className="hidden items-center gap-7 text-base text-(--muted) md:flex" aria-label="Primary">
              {navigation.map((item) => (
                <a key={item.href} href={item.href} className="transition-colors duration-200 hover:text-(--ink)">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-base text-(--muted) transition-colors duration-200 hover:text-(--ink)"
                onClick={() => updateTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? "Dark" : "Light"}
              </button>
              <button
                type="button"
                className="grid size-8 place-items-center md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav id="mobile-navigation" className="border-t border-(--line) px-5 py-4 md:hidden" aria-label="Mobile">
              <div className="mx-auto flex w-[min(1080px,100%)] flex-col gap-3 text-base">
                {navigation.map((item) => (
                  <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
                ))}
              </div>
            </nav>
          )}
        </header>

        <main id="top" className="mx-auto w-[min(1080px,calc(100%-2.5rem))]">
                  <section className="grid gap-12 py-20 sm:py-28 md:grid-cols-[1fr_18rem] md:items-end">
            <div>
                      <h1 className="max-w-3xl text-5xl leading-[1.05] font-medium tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                {site.person.role}
              </h1>
                      <p className="mt-6 max-w-2xl text-xl leading-9 text-(--muted)">{site.person.summary}</p>
                      <p className="mt-5 text-lg text-(--accent)">{site.person.availability}</p>
            </div>
                    <div className="text-lg leading-8 text-(--muted)">
              <p>{site.person.note}</p>
              <p>{site.person.location}</p>
              <div className="mt-5 flex flex-col items-start gap-1">
                <a className="link" href={`mailto:${site.person.email}`}>Email</a>
                <a className="link" href={site.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                <a className="link" href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
                <a className="link" href={site.links.resume} target="_blank">Resume</a>
              </div>
            </div>
          </section>

          <section id="work" className="scroll-mt-20 pb-20">
            <h2 className="section-label">Work</h2>
            <div>
              {site.experience.map((item) => (
                <article key={`${item.organization}-${item.dates}`} className="grid gap-2 border-t border-(--line) py-8 transition-colors duration-300 hover:bg-(--wash) md:grid-cols-[13rem_1fr] md:gap-8">
                                  <p className="text-base text-(--muted)">
                    {item.dates}
                    {item.place ? <span className="mt-1 block">{item.place}</span> : null}
                  </p>
                  <div>
                    <h3 className="text-xl font-medium">{item.organization}</h3>
                                        <p className="mt-1 text-base text-(--accent)">{item.role}</p>
                                        {item.detail ? <p className="mt-3 max-w-2xl whitespace-pre-line text-base leading-7 text-(--muted)">{item.detail}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="projects" className="scroll-mt-20 pb-20">
            <h2 className="section-label">Projects</h2>
            <div className="grid gap-x-12 sm:grid-cols-2">
              {site.projects.map((project) => (
                <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="group border-t border-(--line) py-6">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-xl font-medium transition-colors duration-200 group-hover:text-(--accent)">{project.name}</span>
                                        <span className="text-base text-(--muted) transition-transform duration-200 group-hover:translate-x-1" aria-hidden>→</span>
                  </span>
                                      <span className="mt-2 block max-w-md text-base leading-7 text-(--muted)">{project.detail}</span>
                </a>
              ))}
            </div>
          </section>

          <section id="education" className="scroll-mt-20 grid gap-12 border-t border-(--line) py-16 md:grid-cols-2">
            <div>
              <h2 className="section-label">Education</h2>
              <div className="space-y-6">
                {site.education.map((item) => (
                  <article key={item.school}>
                    <h3 className="text-xl font-medium">{item.school}</h3>
                                        <p className="mt-1 text-base leading-7 text-(--muted)">{item.credential}</p>
                                        <p className="mt-1 text-base text-(--muted)">{item.dates}</p>
                  </article>
                ))}
              </div>
            </div>
            <div>
              <h2 className="section-label">Also</h2>
              <dl className="space-y-5 text-base leading-7">
                <div>
                  <dt className="text-(--muted)">Skills</dt>
                  <dd>{site.aside.skills.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-(--muted)">Languages</dt>
                  <dd>{site.aside.languages.join(" and ")}</dd>
                </div>
                <div>
                  <dt className="text-(--muted)">Recognition</dt>
                  <dd>{site.aside.recognition.join(" · ")}</dd>
                </div>
              </dl>
            </div>
          </section>
        </main>

        <footer id="contact" className="scroll-mt-20 border-t border-(--line)">
          <div className="mx-auto flex w-[min(1080px,calc(100%-2.5rem))] flex-col gap-3 py-8 text-base text-(--muted) sm:flex-row sm:items-center sm:justify-between">
            <a className="link" href={`mailto:${site.person.email}`}>{site.person.email}</a>
            <p>Designed and built by {site.person.name}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
