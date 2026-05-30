import { ArrowDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { hero, heroMicroProof, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

function HeroProductMockup() {
  const appointments = [
    ["10:00", "Corte clasico", "Javier"],
    ["11:30", "Corte + barba", "Matias"],
    ["15:00", "Color + lavado", "Sasha"]
  ];

  return (
    <div aria-label="Vista previa de agenda online y panel de administración" className="relative mx-auto w-full max-w-[680px] lg:max-w-none" role="img">
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(231,184,90,.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(32,143,128,.18),transparent_36%),linear-gradient(135deg,#fbf7ef,#edf5ef)] shadow-lift" />
      <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-ink/10 bg-paper/90 p-4 shadow-lift backdrop-blur min-[390px]:min-h-[410px] sm:min-h-[470px] sm:p-5 lg:min-h-[510px] lg:p-6">
        <div className="rounded-[1.35rem] border border-teal/10 bg-cream p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-action">Panel del negocio</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-teal sm:text-3xl">Agenda ordenada</h2>
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

        <div className="absolute bottom-5 right-4 w-[185px] rounded-[1.8rem] border-[8px] border-teal bg-[#0d211e] shadow-lift min-[390px]:w-[205px] sm:right-5 sm:w-[240px] lg:bottom-6 lg:right-7">
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

        <div className="absolute bottom-4 left-4 max-w-[178px] rounded-2xl bg-teal px-3 py-3 text-cream shadow-lift min-[390px]:max-w-[205px] sm:bottom-6 sm:left-5 sm:px-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gold">Menos ida y vuelta</p>
          <p className="mt-1 text-sm font-bold leading-5">El cliente reserva y el negocio lo ve en el panel.</p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,61,58,.055)_1px,transparent_1px),linear-gradient(0deg,rgba(18,61,58,.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold/25 px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-teal shadow-soft sm:mb-5 sm:text-sm">
            <Sparkles size={15} /> {hero.eyebrow}
          </p>
          <h1 className="max-w-3xl text-balance font-display text-[2.55rem] font-extrabold leading-[1.02] text-teal min-[390px]:text-[2.8rem] sm:text-6xl lg:text-[4.25rem]">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-[1.04rem] font-semibold leading-7 text-ink/72 sm:text-lg sm:leading-8">
            {hero.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {heroMicroProof.map((item) => (
              <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-mint px-4 py-2 text-center text-xs font-extrabold text-teal" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-teal/12 bg-paper px-4 py-3 font-bold text-teal shadow-soft" aria-label="Precios principales">
            <span className="whitespace-nowrap">{hero.price}</span>
            <span className="hidden text-ink/25 sm:inline">|</span>
            <span>Web Completa: $100.000 pago único</span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton className="w-full text-base sm:w-auto" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label={hero.primaryCta} location="hero" />
            <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal px-5 py-3 text-sm font-bold text-teal transition hover:bg-mint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/20 sm:w-auto" href="#web-completa">
              {hero.secondaryCta} <ArrowDown size={18} />
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
}
