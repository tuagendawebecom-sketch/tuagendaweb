import { ArrowDown, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { hero, heroMicroProof, trustSignals, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

function HeroProductMockup() {
  const appointments = [
    ["10:00", "Corte clasico", "Javier"],
    ["11:30", "Corte + barba", "Matias"],
    ["15:00", "Color + lavado", "Sasha"]
  ];

  return (
    <div className="relative mx-auto w-full max-w-[680px] lg:max-w-none">
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(231,184,90,.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(32,143,128,.20),transparent_36%),linear-gradient(135deg,#fbf7ef,#edf5ef)] shadow-lift" />
      <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-ink/10 bg-paper/90 p-5 shadow-lift backdrop-blur lg:min-h-[590px] lg:p-7">
        <div className="rounded-[1.35rem] border border-teal/10 bg-cream p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-action">Panel del negocio</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold text-teal">Agenda ordenada</h2>
            </div>
            <span className="rounded-full bg-mint px-3 py-2 text-xs font-extrabold text-teal">Hoy</span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["18", "turnos"],
              ["6", "servicios"],
              ["3", "profesionales"]
            ].map(([value, label]) => (
              <div className="rounded-2xl bg-paper p-3 shadow-soft" key={label}>
                <p className="font-display text-2xl font-extrabold text-teal">{value}</p>
                <p className="mt-1 text-xs font-bold text-ink/55">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2">
            {appointments.map(([time, service, person]) => (
              <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-2xl bg-paper px-3 py-3" key={`${time}-${service}`}>
                <span className="rounded-full bg-mint px-3 py-2 text-center text-xs font-extrabold text-teal">{time}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-teal">{service}</span>
                  <span className="block truncate text-xs font-semibold text-ink/52">{person}</span>
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-action" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-5 right-5 w-[230px] rounded-[2rem] border-[10px] border-teal bg-[#0d211e] shadow-lift sm:w-[250px] lg:bottom-7 lg:right-8">
          <div className="rounded-[1.35rem] bg-cream p-4">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/20" />
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-action">Reserva online</p>
            <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-teal">Elegí tu turno</h3>
            <div className="mt-4 grid gap-2">
              {["Corte + barba", "Centro", "Martes 15:00"].map((item) => (
                <div className="rounded-2xl bg-paper px-3 py-3 text-xs font-extrabold text-teal shadow-soft" key={item}>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-teal px-3 py-3 text-center text-xs font-extrabold text-cream">
              Turno confirmado
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-6 max-w-[210px] rounded-2xl bg-teal px-4 py-3 text-cream shadow-lift">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gold">Menos ida y vuelta</p>
          <p className="mt-1 text-sm font-bold leading-5">El cliente reserva y el negocio lo ve en el panel.</p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-6 sm:px-6 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,61,58,.055)_1px,transparent_1px),linear-gradient(0deg,rgba(18,61,58,.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold/25 px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-teal shadow-soft sm:mb-5 sm:text-sm">
            <Sparkles size={15} /> {hero.eyebrow}
          </p>
          <h1 className="max-w-3xl text-balance font-display text-[2.35rem] font-extrabold leading-[1.02] text-teal min-[390px]:text-[2.55rem] sm:text-6xl lg:text-[4.2rem]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] font-semibold leading-7 text-ink/72 sm:mt-6 sm:text-lg sm:leading-8">
            {hero.subtitle}
          </p>
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

        <div className="min-w-0">
          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
}
