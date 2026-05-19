import { ArrowDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { hero, trustSignals, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { DemoMockup } from "./DemoMockup";
import { WhatsAppButton } from "./WhatsAppButton";

export function Hero() {
  return (
    <section className="overflow-hidden px-4 pb-12 pt-9 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-12">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-gold/25 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-teal sm:mb-5 sm:text-sm">{hero.eyebrow}</p>
          <h1 className="max-w-3xl text-balance font-display text-[2.35rem] font-extrabold leading-[1.05] text-teal sm:text-6xl">{hero.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72 sm:mt-6 sm:text-lg sm:leading-8">{hero.subtitle}</p>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-ink/60">{hero.support}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-2xl border border-teal/15 bg-paper px-4 py-3 font-display text-xl font-extrabold text-teal sm:text-2xl">{hero.price}</span>
            <span className="inline-flex max-w-sm items-center gap-2 text-sm font-semibold leading-6 text-ink/65">
              <CheckCircle2 className="text-action" size={18} /> Web Completa: $100.000 pago único
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton className="w-full sm:w-auto" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label={hero.primaryCta} location="hero" />
            <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal px-5 py-3 text-sm font-bold text-teal transition hover:bg-mint sm:w-auto" href="#web-completa">
              {hero.secondaryCta} <ArrowDown size={18} />
            </Link>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {trustSignals.map((signal) => (
              <p className="flex items-start gap-2 rounded-2xl bg-paper/80 px-4 py-3 text-sm font-semibold leading-5 text-ink/68 shadow-soft" key={signal}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-action" size={17} />
                {signal}
              </p>
            ))}
          </div>
        </div>
        <DemoMockup desktopSrc="/assets/hero/barberia-hero-desktop.png" mobileSrc="/assets/hero/barberia-hero-mobile.png" title="TuAgendaWeb" />
      </div>
    </section>
  );
}
