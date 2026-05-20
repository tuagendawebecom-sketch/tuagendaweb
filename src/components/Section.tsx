import type { ReactNode } from "react";

type SectionProps = Readonly<{
  id?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  children: ReactNode;
  tone?: "default" | "mint" | "dark";
}>;

export function Section({ id, eyebrow, title, text, children, tone = "default" }: SectionProps) {
  const toneClass =
    tone === "dark" ? "bg-teal text-cream" : tone === "mint" ? "bg-mint/55 text-ink" : "bg-transparent text-ink";

  return (
    <section className={`px-4 py-14 sm:px-6 sm:py-16 lg:py-24 ${toneClass}`} id={id}>
      <div className="mx-auto max-w-7xl">
        {title ? (
          <div className="mb-10 max-w-3xl">
            {eyebrow ? <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-action">{eyebrow}</p> : null}
            <h2 className="font-display text-3xl font-bold leading-tight text-teal sm:text-4xl">{title}</h2>
            {text ? <p className="mt-4 text-lg leading-8 text-ink/70">{text}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
