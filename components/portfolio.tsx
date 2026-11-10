"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, Cpu, ExternalLink, Search, X } from "lucide-react";
import Image from "next/image";

import { projects, type Project } from "@/data/projects";

type Site = typeof import("@/data/site.json");

const categoryColors: Record<string, string> = {
  Healthcare: "bg-rose-100 text-rose-700",
  Education: "bg-violet-100 text-violet-700",
  Robotics: "bg-emerald-100 text-emerald-800",
  "Public Safety": "bg-orange-100 text-orange-800",
  "Embedded Systems": "bg-teal-100 text-teal-800",
  "Health & Fitness": "bg-pink-100 text-pink-700",
  "Non-profit": "bg-fuchsia-100 text-fuchsia-700",
};
const defaultCategory = "bg-amber-100 text-amber-800";

function matches(project: Project, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    project.name,
    project.category,
    project.summary,
    project.ee ? "ee electrical engineering" : "",
    project.ai ? "ai artificial intelligence" : "",
    project.swe ? "swe software engineering" : "",
    ...project.skills,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => {
    if (term === "ai") return Boolean(project.ai);
    if (term === "swe") return Boolean(project.swe);
    return haystack.includes(term);
  });
}

function ProjectCard({ project, onTag }: { project: Project; onTag: (tag: string) => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-xl border bg-white p-5 shadow-sm ${project.ee ? "border-sky-300" : "border-(--line)"}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-(--muted)">{project.dateLabel}</span>
        {project.ee && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
            <Cpu size={12} /> Electrical Engineering
          </span>
        )}
        {project.ai && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
            AI
          </span>
        )}
        {project.swe && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            SWE
          </span>
        )}
      </div>
      <h3 className="mt-2 text-xl font-semibold">{project.name}</h3>
      <button
        type="button"
        onClick={() => onTag(project.category)}
        className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[project.category] ?? defaultCategory}`}
      >
        {project.category}
      </button>
      <p className="mt-3 text-sm leading-relaxed text-(--muted)">{project.summary}</p>

      {project.image && (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          sizes="(max-width: 767px) 100vw, 500px"
          className="mt-4 h-auto w-full rounded-xl border border-(--line)"
        />
      )}

      {project.youtubeId && (
        <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-(--line)">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}`}
            title={`${project.name} video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.skills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => onTag(skill)}
            className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs text-sky-800 ring-1 ring-sky-200 transition-colors hover:bg-sky-100"
          >
            {skill}
          </button>
        ))}
      </div>

      {project.links.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-700"
            >
              {link.label} <ExternalLink size={14} />
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export function Portfolio({ site }: { site: Site }) {
  const [query, setQuery] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 70%", "end 70%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  const sorted = useMemo(() => [...projects].sort((a, b) => b.date.localeCompare(a.date)), []);
  const matchingProjects = useMemo(() => sorted.filter((project) => matches(project, query)), [sorted, query]);
  const visible = matchingProjects.filter((project) => !project.archived);
  const archived = matchingProjects.filter((project) => project.archived);

  const toggleTag = (tag: string) => setQuery((current) => (current.toLowerCase() === tag.toLowerCase() ? "" : tag));

  return (
    <div>
      <div className="page-surface relative min-h-screen overflow-x-clip">
        <header className="sticky top-0 z-30 border-b border-(--line) bg-(--surface)">
          <div className="mx-auto flex w-[min(1080px,calc(100%-2rem))] items-center gap-3 py-3">
            <a href="#top" className="hidden shrink-0 text-base font-semibold sm:block">
              {site.person.name}
            </a>
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--muted)" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Looking for something? Try ESP32, python, healthcare..."
                aria-label="Search projects"
                                className="w-full rounded-full border border-(--line) bg-white py-2 pr-9 pl-9 text-sm outline-none focus:border-sky-500"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-(--muted)"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        <main id="top" className="mx-auto w-[min(1080px,calc(100%-2rem))] pb-24">
          <section className="py-12 text-center">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm sm:size-28">
                <Image
                  src="/newpicture.jpeg"
                  alt={`Portrait of ${site.person.name}`}
                  width={224}
                  height={224}
                  className="size-full scale-[1.8] object-cover object-[50%_48%]"
                />
              </div>
              <h1 className="text-left text-3xl font-semibold sm:text-4xl">Hi, I&apos;m {site.person.name}!</h1>
            </div>
            <p className="mt-2 text-(--muted)">
              {site.person.role} · {site.person.note}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base text-(--muted)">{site.person.summary}</p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-(--muted)">
              Check out all the projects I&apos;ve been building! You can use the search bar above to filter out keywords.
            </p>
            <div className="mt-5 flex justify-center gap-5 text-sm">
              <a className="link" href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
              <a className="link" href={site.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="link" href={`mailto:${site.person.email}`}>Email</a>
              <a className="link" href={site.links.resume}>Resume</a>
            </div>
          </section>

          <div ref={timelineRef} className="relative">
            <div className="absolute top-0 bottom-0 left-4 w-px -translate-x-1/2 bg-(--line) md:left-1/2" aria-hidden>
              <motion.div
                className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_3px_rgba(56,152,255,0.7)]"
                style={{ scaleY: progress, width: 3, left: -1 }}
              />
            </div>

            {visible.length === 0 && (
              <p className="py-16 text-center text-(--muted)">
                {archived.length > 0
                  ? "Matching projects can be found in the archive below."
                  : <>No projects match &ldquo;{query}&rdquo;.</>}
              </p>
            )}

            <ol className="space-y-10">
              {visible.map((project, index) => (
                <li key={project.name} className="relative pl-10 md:grid md:grid-cols-2 md:gap-14 md:pl-0">
                  <span
                    className={`absolute top-6 left-4 size-3 -translate-x-1/2 rounded-full ring-4 ring-(--surface) md:left-1/2 ${
                      project.ee ? "bg-sky-500 shadow-[0_0_10px_2px_rgba(56,152,255,0.6)]" : "bg-stone-400"
                    }`}
                  />
                  <div className={index % 2 === 0 ? "md:col-start-1" : "md:col-start-2"}>
                    <ProjectCard project={project} onTag={toggleTag} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="archive-heading">
            <h2 id="archive-heading">
              <button
                type="button"
                aria-expanded={archiveOpen}
                aria-controls="archive-projects"
                onClick={() => setArchiveOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-(--line) bg-white px-5 py-4 text-left font-semibold shadow-sm transition-colors hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <span>
                  Archived / side projects
                  <span className="ml-2 text-sm font-normal text-(--muted)">
                    ({archived.length}{query.trim() ? " matching" : ""})
                  </span>
                </span>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={`shrink-0 transition-transform motion-reduce:transition-none ${archiveOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h2>
            <div
              id="archive-projects"
              aria-hidden={!archiveOpen}
              inert={!archiveOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${archiveOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                {archived.length > 0 ? (
                  <ul className="grid gap-5 pt-5 md:grid-cols-2">
                    {archived.map((project) => (
                      <li key={project.name}>
                        <ProjectCard project={project} onTag={toggleTag} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pt-5 text-sm text-(--muted)">No archived projects match this search.</p>
                )}
              </div>
            </div>
          </section>

          <section id="experience" className="mt-24 border-t border-(--line) pt-10">
            <h2 className="section-label">Where I&apos;ve worked</h2>
            <ul className="space-y-5">
              {site.experience.map((item) => (
                <li key={item.organization + item.role} className="text-sm">
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <span className="font-medium">
                      {item.role}, {item.organization}
                    </span>
                    <span className="text-(--muted)">{item.dates}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-(--muted)">{item.detail}</p>
                </li>
              ))}
            </ul>

            <h2 className="section-label pt-10">Campus leadership</h2>
            <ul className="space-y-2 text-sm">
              {site.activities.map((item) => (
                <li key={item.organization}>
                  <span className="font-medium">{item.role}, {item.organization}</span>
                </li>
              ))}
            </ul>

            <h2 className="section-label pt-10">Where I&apos;ve studied</h2>
            <ul className="space-y-2 text-sm">
              {site.education.map((item) => (
                <li key={item.school}>
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <span>
                      {item.school}, {item.credential}
                    </span>
                    <span className="text-(--muted)">{item.dates}</span>
                  </div>
                  {item.coursework.length > 0 && (
                    <div className="mt-3 mb-5">
                      <p className="mb-2 text-(--muted)">Relevant coursework</p>
                      <ul className="flex flex-wrap gap-2">
                        {item.coursework.map((course) => (
                          <li key={course} className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-800 ring-1 ring-sky-200">
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-10 text-sm text-(--muted)">
              {site.person.availability} Reach out at <a className="link" href={`mailto:${site.person.email}`}>{site.person.email}</a>!
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
