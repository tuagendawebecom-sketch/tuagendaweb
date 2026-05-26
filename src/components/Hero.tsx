import { ArrowDown, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { hero, heroMicroProof, trustSignals, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-5 sm:px-6 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,61,58,.055)_1px,transparent_1px),linear-gradient(0deg,rgba(18,61,58,.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold/25 px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-teal shadow-soft sm:mb-5 sm:text-sm">
            <Sparkles size={15} /> {hero.eyebrow}
          </p>
          <h1 className="max-w-3xl text-balance font-display text-[2.25rem] font-extrabold leading-[0.98] text-teal min-[390px]:text-[2.35rem] sm:text-6xl lg:text-[4.55rem]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] font-semibold leading-7 text-ink/72 sm:mt-6 sm:text-lg sm:leading-8">
            {hero.subtitle}
          </p>
          <div className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper shadow-lift lg:hidden">
            <Image
              alt="Agenda online TuAgendaWeb para barberias con panel y reserva desde celular"
              className="h-auto w-full object-cover"
              height={1040}
              priority
              sizes="100vw"
              src="/assets/hero/tuagendaweb-hero-barberias.png"
              width={1500}
            />
          </div>
          <p className="mt-4 max-w-2xl rounded-2xl border border-ink/10 bg-paper/78 px-4 py-3 text-sm font-bold leading-6 text-ink/62 shadow-soft">
            {hero.support}
          </p>

          <div className="mt-4 grid gap-2 min-[430px]:grid-cols-3 sm:mt-5">
            {heroMicroProof.map((item) => (
              <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-mint px-3 py-2 text-center text-xs font-extrabold text-teal" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:mt-6 sm:flex sm:flex-wrap sm:items-center">
            <span className="rounded-2xl border border-teal/15 bg-paper px-4 py-3 text-center font-display text-xl font-extrabold text-teal shadow-soft sm:text-2xl">
              {hero.price}
            </span>
            <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-center text-sm font-extrabold leading-6 text-cream shadow-soft sm:max-w-sm">
              <CheckCircle2 className="text-gold" size={18} /> Web Completa: $100.000 pago unico
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <WhatsAppButton className="w-full text-base sm:w-auto" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label={hero.primaryCta} location="hero" />
            <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal px-5 py-3 text-sm font-bold text-teal transition hover:bg-mint sm:w-auto" href="#web-completa">
              {hero.secondaryCta} <ArrowDown size={18} />
            </Link>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink/55">
            <MessageCircle className="text-action" size={17} /> Te respondo por WhatsApp y vemos si encaja para tu rubro.
          </p>

          <div className="mt-7 hidden gap-2 sm:grid sm:grid-cols-2">
            {trustSignals.map((signal) => (
              <p className="flex items-start gap-2 rounded-2xl bg-paper/80 px-4 py-3 text-sm font-semibold leading-5 text-ink/68 shadow-soft" key={signal}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-action" size={17} />
                {signal}
              </p>
            ))}
          </div>
        </div>

        <div className="relative hidden min-w-0 overflow-hidden rounded-[1.6rem] border border-ink/10 bg-paper shadow-lift lg:block lg:rounded-[2.25rem]">
          <Image
            alt="Agenda online TuAgendaWeb para barberias con panel y reserva desde celular"
            className="h-auto w-full object-cover"
            height={1040}
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            src="/assets/hero/tuagendaweb-hero-barberias.png"
            width={1500}
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-teal/92 px-4 py-3 text-cream shadow-lift backdrop-blur sm:hidden">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gold">Pensado para vender hoy</p>
            <p className="mt-1 text-sm font-bold">Tu link de reservas puede ir directo a la bio de Instagram.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
