import Link from "next/link";
import { CalendarCheck, Camera, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import type { PublicBookingData } from "@/lib/firebase/reservations";
import type { PublicBusiness, PublicWebContent } from "@/types/tenant";

type PublicWebCompletePageProps = {
  business: PublicBusiness;
  webContent: PublicWebContent;
  bookingData?: PublicBookingData;
  canReserve?: boolean;
  showBackLink?: boolean;
  reservationHref?: string;
  showBookingSection?: boolean;
};

function contactHref(phone?: string) {
  if (!phone) return "#reservar";
  return `https://wa.me/${phone}`;
}

export function PublicWebCompletePage({
  business,
  webContent,
  bookingData,
  canReserve = false,
  showBackLink = true,
  reservationHref = "#reservar",
  showBookingSection = true
}: PublicWebCompletePageProps) {
  const primary = business.colorPrimario || "#123D3A";
  const secondary = business.colorSecundario || "#E7B85A";
  const benefits = [
    [webContent.beneficio1Titulo, webContent.beneficio1Texto],
    [webContent.beneficio2Titulo, webContent.beneficio2Texto],
    [webContent.beneficio3Titulo, webContent.beneficio3Texto]
  ];

  return (
    <main className="min-h-screen bg-cream text-ink" style={{ "--tenant-primary": primary, "--tenant-secondary": secondary } as CSSProperties}>
      <header className="border-b border-ink/10 bg-paper/92 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link className="flex min-w-0 items-center gap-3" href="#inicio">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream text-sm font-extrabold ring-1 ring-ink/10" style={{ color: primary }}>
              {business.logoUrl ? <img alt={`Logo de ${business.nombre}`} className="h-full w-full object-contain p-1.5" src={business.logoUrl} /> : business.initials ?? business.nombre.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-xl font-extrabold" style={{ color: primary }}>{business.nombre}</span>
              <span className="block text-xs font-bold text-ink/50">{business.rubro || "Reservas online"}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-bold text-ink/62 md:flex" aria-label="Secciones del negocio">
            <Link className="hover:text-teal" href="#servicios">Servicios</Link>
            <Link className="hover:text-teal" href="#beneficios">Beneficios</Link>
            <Link className="hover:text-teal" href="#reservar">Reservar</Link>
            <Link className="hover:text-teal" href="#contacto">Contacto</Link>
          </nav>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold text-white" href={reservationHref} style={{ backgroundColor: primary }}>
            Reservar
          </Link>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-16" id="inicio">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            {showBackLink ? (
              <Link className="mb-5 inline-flex text-sm font-bold text-teal hover:text-action" href="/">
                Volver a TuAgendaWeb
              </Link>
            ) : null}
            <p className="inline-flex rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em]" style={{ backgroundColor: `${secondary}33`, color: primary }}>
              {webContent.heroEtiqueta}
            </p>
            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-tight sm:text-6xl" style={{ color: primary }}>{webContent.heroTitulo}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/68">{webContent.heroSubtitulo}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white" href={reservationHref} style={{ backgroundColor: primary }}>
                <CalendarCheck size={18} /> {webContent.ctaPrincipalTexto}
              </Link>
              {business.whatsapp ? (
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-extrabold" href={contactHref(business.whatsapp)} rel="noopener noreferrer" target="_blank" style={{ borderColor: primary, color: primary }}>
                  <MessageCircle size={18} /> WhatsApp
                </Link>
              ) : null}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-soft">
            {webContent.heroImageUrl ? (
              <img alt={`Imagen principal de ${business.nombre}`} className="aspect-[4/3] w-full object-cover" src={webContent.heroImageUrl} />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-[linear-gradient(135deg,#F7F4EE,#DCEBE5)] p-8 text-center">
                <div>
                  <p className="font-display text-4xl font-extrabold" style={{ color: primary }}>{business.nombre}</p>
                  <p className="mt-3 text-sm font-bold text-ink/55">Imagen principal pendiente</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6" id="servicios">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="font-display text-4xl font-extrabold" style={{ color: primary }}>{webContent.sobreTitulo}</h2>
            <p className="mt-4 leading-8 text-ink/68">{webContent.sobreTexto}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(bookingData?.services ?? []).slice(0, 6).map((service) => (
              <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft" key={service.id}>
                <p className="font-display text-xl font-extrabold" style={{ color: primary }}>{service.nombre}</p>
                <p className="mt-2 text-sm font-bold text-ink/55">{service.duracionMin} min {typeof service.precio === "number" ? `- $ ${service.precio.toLocaleString("es-AR")}` : ""}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6" id="beneficios">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl font-display text-4xl font-extrabold" style={{ color: primary }}>{webContent.beneficiosTitulo}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {benefits.map(([title, text]) => (
              <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft" key={title}>
                <CheckCircle2 style={{ color: secondary }} />
                <h3 className="mt-4 font-display text-2xl font-extrabold" style={{ color: primary }}>{title}</h3>
                <p className="mt-3 leading-7 text-ink/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showBookingSection && bookingData ? (
      <section className="px-4 py-10 sm:px-6" id="reservar">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft">
            <h2 className="font-display text-4xl font-extrabold" style={{ color: primary }}>{webContent.finalCtaTitulo}</h2>
            <p className="mt-3 max-w-3xl leading-8 text-ink/68">{webContent.finalCtaTexto}</p>
          </div>
          <PublicBookingFlow bookingData={bookingData} business={business} canReserve={canReserve} />
        </div>
      </section>
      ) : (
      <section className="px-4 py-10 sm:px-6" id="reservar">
        <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-4xl font-extrabold" style={{ color: primary }}>{webContent.finalCtaTitulo}</h2>
          <p className="mt-3 max-w-3xl leading-8 text-ink/68">{webContent.finalCtaTexto}</p>
          <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white" href={reservationHref} style={{ backgroundColor: primary }}>
            <CalendarCheck size={18} /> Ir a reservas
          </Link>
        </div>
      </section>
      )}

      <footer className="px-4 py-10 sm:px-6" id="contacto">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold" style={{ color: primary }}>{business.nombre}</p>
            <p className="mt-2 text-sm font-semibold text-ink/55">Reservas online por TuAgendaWeb</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {business.instagram ? <Link className="inline-flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-teal" href={business.instagram} target="_blank"><Camera size={16} /> Instagram</Link> : null}
            {webContent.mapaLinkUrl ? <Link className="inline-flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-teal" href={webContent.mapaLinkUrl} target="_blank"><MapPin size={16} /> Ubicacion</Link> : null}
            {business.whatsapp ? <Link className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white" href={contactHref(business.whatsapp)} target="_blank" style={{ backgroundColor: primary }}><MessageCircle size={16} /> WhatsApp</Link> : null}
          </div>
        </div>
      </footer>
    </main>
  );
}
