import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
  Sparkles
} from "lucide-react";
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
  const normalized = phone?.replace(/\D/g, "");
  return normalized ? `https://wa.me/${normalized}` : "#contacto";
}

function ensureUrl(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function getImageSrc(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("http") || trimmed.startsWith("data:")) return trimmed;
  return `/${trimmed}`;
}

function getMapEmbedSrc(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1] ?? trimmed;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatPrice(value?: number) {
  if (!value) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

function serviceSummary(service: PublicBookingData["services"][number]) {
  return [service.duracionMin ? `${service.duracionMin} min` : "", formatPrice(service.precio)].filter(Boolean).join(" · ");
}

function BrandMark({ business, primary, secondary }: { business: PublicBusiness; primary: string; secondary: string }) {
  const logoSrc = getImageSrc(business.logoUrl);
  return (
    <span
      className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 bg-white text-sm font-black shadow-sm ring-1 ring-black/5 sm:h-[60px] sm:w-[60px]"
      style={{ borderColor: `${secondary}AA`, color: primary }}
    >
      {logoSrc ? (
        <img alt={`Logo de ${business.nombre}`} className="h-full w-full object-cover" src={logoSrc} />
      ) : (
        <span className="grid h-full w-full place-items-center" style={{ backgroundColor: `${secondary}55` }}>
          {business.initials ?? getInitials(business.nombre)}
        </span>
      )}
    </span>
  );
}

function ImagePanel({
  alt,
  business,
  className,
  primary,
  src
}: {
  alt: string;
  business: PublicBusiness;
  className: string;
  primary: string;
  src?: string;
}) {
  const imageSrc = getImageSrc(src);
  if (imageSrc) {
    return (
      <img alt={alt} className={className} src={imageSrc} />
    );
  }

  return (
    <div className={`${className} grid place-items-center bg-[linear-gradient(135deg,#F7F4EE,#E5EFE9)] p-8 text-center`}>
      <div>
        <p className="font-display text-3xl font-black" style={{ color: primary }}>
          {business.nombre}
        </p>
        <p className="mt-3 text-sm font-bold text-[#52615d]">Imagen editable pendiente</p>
      </div>
    </div>
  );
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
  const primaryBgStyle = { backgroundColor: primary } as CSSProperties;
  const secondaryStyle = { backgroundColor: secondary, color: primary } as CSSProperties;
  const primaryTextStyle = { color: primary } as CSSProperties;
  const borderStyle = { borderColor: `${primary}22` } as CSSProperties;
  const whatsappHref = contactHref(business.whatsapp);
  const mapLink = ensureUrl(webContent.mapaLinkUrl);
  const mapEmbedSrc = getMapEmbedSrc(webContent.mapaEmbedUrl);
  const services = bookingData?.services ?? [];
  const visibleServices = services.slice(0, 6);
  const benefitCards = [
    [webContent.beneficio1Titulo, webContent.beneficio1Texto],
    [webContent.beneficio2Titulo, webContent.beneficio2Texto],
    [webContent.beneficio3Titulo, webContent.beneficio3Texto]
  ].filter(([title]) => title);
  const packages = [
    {
      name: webContent.paquete1Nombre,
      text: webContent.paquete1Texto,
      features: [webContent.paquete1Feature1, webContent.paquete1Feature2, webContent.paquete1Feature3].filter(Boolean)
    },
    {
      name: webContent.paquete2Nombre,
      text: webContent.paquete2Texto,
      features: [webContent.paquete2Feature1, webContent.paquete2Feature2, webContent.paquete2Feature3].filter(Boolean),
      highlighted: true
    },
    {
      name: webContent.paquete3Nombre,
      text: webContent.paquete3Texto,
      features: [webContent.paquete3Feature1, webContent.paquete3Feature2, webContent.paquete3Feature3].filter(Boolean)
    }
  ].filter((item) => item.name);
  const experiences = [
    [webContent.experiencia1Titulo, webContent.experiencia1Texto],
    [webContent.experiencia2Titulo, webContent.experiencia2Texto],
    [webContent.experiencia3Titulo, webContent.experiencia3Texto]
  ].filter(([title]) => title);
  const faqs = [
    [webContent.faq1Pregunta, webContent.faq1Respuesta],
    [webContent.faq2Pregunta, webContent.faq2Respuesta],
    [webContent.faq3Pregunta, webContent.faq3Respuesta]
  ].filter(([question, answer]) => question && answer);
  const socialLinks = [
    business.instagram ? { label: "Instagram", href: ensureUrl(business.instagram), icon: Camera } : null,
    webContent.facebook ? { label: "Facebook", href: ensureUrl(webContent.facebook), icon: ExternalLink } : null,
    mapLink ? { label: webContent.mapaTexto || "Mapa", href: mapLink, icon: MapPin } : null
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Camera }>;
  const navLinks = [
    ["#servicios", webContent.navServiciosTexto],
    ["#beneficios", webContent.navBeneficiosTexto],
    ["#opciones", webContent.navPaquetesTexto],
    ["#contacto", webContent.navContactoTexto]
  ].filter(([, label]) => label);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f4f3ee] text-[#101c19]">
      <header className="sticky top-0 z-40 border-b bg-[#f4f3ee]/94 backdrop-blur-xl" style={borderStyle}>
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <Link className="flex min-w-0 items-center gap-3.5" href="/">
            <BrandMark business={business} primary={primary} secondary={secondary} />
            <span className="min-w-0 leading-none">
              <span className="block max-w-[42vw] truncate font-display text-lg font-black tracking-tight sm:max-w-[260px] sm:text-xl" style={primaryTextStyle}>
                {business.nombre}
              </span>
              <span className="mt-1 block max-w-[42vw] truncate text-xs font-bold leading-tight text-[#52615d] sm:max-w-[260px]">
                {webContent.landingSubtituloMarca || business.rubro || "Reservas online"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-[#40504c] md:flex" aria-label="Secciones del negocio">
            {navLinks.map(([href, label]) => (
              <a className="transition hover:opacity-65" href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>

          <Link className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/10" href={reservationHref} style={primaryBgStyle}>
            {webContent.ctaPrincipalTexto || "Reservar"}
          </Link>
        </div>
      </header>

      <section className="px-4 py-12 sm:px-6 lg:py-20" id="inicio">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            {showBackLink ? (
              <Link className="mb-5 inline-flex text-sm font-bold hover:opacity-70" href="/" style={primaryTextStyle}>
                Volver a TuAgendaWeb
              </Link>
            ) : null}
            <p className="inline-flex rounded-full border bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-sm" style={{ ...borderStyle, color: primary }}>
              {webContent.heroEtiqueta}
            </p>
            <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-black leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.4rem]" style={primaryTextStyle}>
              {webContent.heroTitulo}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#52615d] sm:text-lg">
              {webContent.heroSubtitulo}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-black text-white shadow-xl shadow-black/10" href={reservationHref} style={primaryBgStyle}>
                <CalendarCheck size={18} /> {webContent.ctaPrincipalTexto || "Reservar turno"}
              </Link>
              {business.whatsapp ? (
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border bg-white px-7 py-4 text-sm font-black shadow-sm" href={whatsappHref} rel="noreferrer" style={{ ...borderStyle, color: primary }} target="_blank">
                  <MessageCircle size={18} /> {webContent.ctaSecundarioTexto || "WhatsApp"}
                </a>
              ) : null}
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-2 gap-4">
              <div className="rounded-3xl border bg-white p-5 shadow-xl shadow-black/5" style={borderStyle}>
                <p className="text-3xl font-black" style={primaryTextStyle}>
                  {services.length || "+"}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#52615d]">Servicios disponibles</p>
              </div>
              <div className="rounded-3xl border bg-white p-5 shadow-xl shadow-black/5" style={borderStyle}>
                <p className="text-3xl font-black" style={primaryTextStyle}>
                  Online
                </p>
                <p className="mt-1 text-sm font-semibold text-[#52615d]">Reservas desde el celular</p>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2rem] p-1.5 shadow-2xl shadow-black/20" style={primaryBgStyle}>
              <ImagePanel alt={`Imagen principal de ${business.nombre}`} business={business} className="h-[360px] w-full rounded-[1.6rem] object-cover sm:h-[480px] lg:h-[540px]" primary={primary} src={webContent.heroImageUrl} />
              <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 p-5 text-white shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8" style={{ backgroundColor: `${primary}e8` }}>
                <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: secondary }}>
                  {webContent.heroCardEtiqueta}
                </p>
                <p className="mt-2 text-2xl font-black">{webContent.heroCardTitulo}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{webContent.heroCardTexto}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-white sm:py-20 lg:py-28" id="servicios" style={primaryBgStyle}>
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: secondary }}>
                {webContent.serviciosEtiqueta}
              </p>
              <h2 className="mt-4 max-w-3xl text-balance font-display text-3xl font-black tracking-tight sm:text-5xl">
                {webContent.queHacemosTitulo}
              </h2>
            </div>
            <p className="text-base leading-7 text-white/68 lg:col-span-5">{webContent.queHacemosTexto}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleServices.length ? (
              visibleServices.map((service, index) => (
                <article className="flex min-h-[190px] flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-black/10" key={service.id}>
                  <span className="mb-6 grid h-11 w-11 place-items-center rounded-2xl text-sm font-black" style={secondaryStyle}>
                    {index + 1}
                  </span>
                  <h3 className="font-display text-xl font-black">{service.nombre}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">{serviceSummary(service) || "Disponible para reservar online."}</p>
                  <Link className="mt-auto pt-6 text-sm font-black" href={reservationHref} style={{ color: secondary }}>
                    {webContent.ctaPrincipalTexto}
                  </Link>
                </article>
              ))
            ) : (
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 text-sm font-bold leading-7 text-white/72 lg:col-span-3">
                Todavia no hay servicios cargados. Desde el panel del cliente se pueden agregar y se muestran automaticamente en esta seccion.
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f3ee] px-4 py-16 sm:px-6 lg:py-24" id="beneficios">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-1.5 shadow-2xl shadow-black/10">
              <ImagePanel alt={`Imagen de ${business.nombre}`} business={business} className="h-[360px] w-full rounded-[1.6rem] object-cover sm:h-[520px]" primary={primary} src={webContent.galeriaImageUrl1} />
              {getImageSrc(webContent.galeriaImageUrl2) ? (
                <ImagePanel alt={`Detalle de ${business.nombre}`} business={business} className="absolute bottom-7 right-7 hidden h-44 w-56 rounded-[1.25rem] border-2 border-white object-cover shadow-2xl md:block" primary={primary} src={webContent.galeriaImageUrl2} />
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-6">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.beneficiosEtiqueta}</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-black tracking-tight sm:text-5xl" style={primaryTextStyle}>
              {webContent.sobreTitulo || webContent.beneficiosTitulo}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#52615d]">{webContent.sobreTexto}</p>
            <div className="mt-8 grid gap-4">
              {benefitCards.map(([title, text]) => (
                <article className="rounded-3xl border bg-white p-5 shadow-sm" key={title} style={borderStyle}>
                  <p className="font-display text-lg font-black" style={primaryTextStyle}>{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#52615d]">{text || webContent.beneficioDetalleTexto}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-white lg:py-24" id="opciones" style={primaryBgStyle}>
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: secondary }}>{webContent.paquetesEtiqueta}</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-black tracking-tight sm:text-5xl">{webContent.paquetesTitulo}</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packages.map((item) => (
              <article className={`rounded-[1.75rem] border p-7 ${item.highlighted ? "" : "border-white/10 bg-white/[0.06]"}`} key={item.name} style={item.highlighted ? { backgroundColor: secondary, color: primary, borderColor: secondary } : undefined}>
                <h3 className="font-display text-2xl font-black">{item.name}</h3>
                <p className="mt-4 min-h-16 text-sm leading-7 opacity-78">{item.text}</p>
                <ul className="mt-6 space-y-3 text-sm font-bold">
                  {item.features.map((feature) => (
                    <li className="flex items-center gap-3" key={feature}>
                      <CheckCircle2 size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f3ee] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.menuEtiqueta}</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-black tracking-tight sm:text-5xl" style={primaryTextStyle}>{webContent.menuTitulo}</h2>
          </div>
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-[1.5rem] border bg-white p-1 shadow-2xl shadow-black/10" style={borderStyle}>
              <ImagePanel alt={`Experiencia de ${business.nombre}`} business={business} className="h-[270px] w-full rounded-[1.25rem] object-cover sm:h-[360px]" primary={primary} src={webContent.seccion5ImageUrl} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:col-span-12">
            {experiences.map(([title, text]) => (
              <article className="rounded-[1.25rem] border bg-white p-5 shadow-sm" key={title} style={borderStyle}>
                <Sparkles size={20} style={primaryTextStyle} />
                <h3 className="mt-4 font-display text-lg font-black" style={primaryTextStyle}>{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#52615d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showBookingSection && bookingData ? (
        <section className="px-4 py-16 sm:px-6" id="reservar">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-[1.5rem] border bg-white p-6 shadow-sm" style={borderStyle}>
              <p className="text-xs font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.finalCtaEtiqueta}</p>
              <h2 className="mt-3 font-display text-4xl font-black" style={primaryTextStyle}>{webContent.finalCtaTitulo}</h2>
              <p className="mt-3 max-w-3xl leading-8 text-[#52615d]">{webContent.finalCtaTexto}</p>
            </div>
            <PublicBookingFlow bookingData={bookingData} business={business} canReserve={canReserve} />
          </div>
        </section>
      ) : (
        <section className="px-4 py-16 sm:px-6" id="reservar">
          <div className="mx-auto max-w-6xl rounded-[1.5rem] border bg-white p-6 shadow-sm sm:p-8" style={borderStyle}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.finalCtaEtiqueta}</p>
            <h2 className="mt-3 font-display text-4xl font-black" style={primaryTextStyle}>{webContent.finalCtaTitulo}</h2>
            <p className="mt-3 max-w-3xl leading-8 text-[#52615d]">{webContent.finalCtaTexto}</p>
            <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white" href={reservationHref} style={primaryBgStyle}>
              <CalendarCheck size={18} /> Ir a reservas
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white/60 px-4 py-16 sm:px-6" id="contacto">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.contactoTitulo}</p>
            <h2 className="mt-4 font-display text-4xl font-black" style={primaryTextStyle}>{business.nombre}</h2>
            <p className="mt-4 leading-8 text-[#52615d]">{webContent.footerTexto}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-[#52615d]">
              {webContent.direccion ? <p><MapPin className="mr-2 inline" size={17} />{webContent.direccion}</p> : null}
              {webContent.zonaAtencion ? <p>{webContent.zonaAtencion}</p> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {business.whatsapp ? (
                <a className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-white" href={whatsappHref} rel="noreferrer" target="_blank" style={primaryBgStyle}>
                  <MessageCircle size={16} /> WhatsApp
                </a>
              ) : null}
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-sm font-black" href={href} key={label} rel="noreferrer" target="_blank" style={{ ...borderStyle, color: primary }}>
                  <Icon size={16} /> {label}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            {mapEmbedSrc ? (
              <iframe className="h-[360px] w-full rounded-[1.5rem] border-0 shadow-xl shadow-black/10" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedSrc} title={`Mapa de ${business.nombre}`} />
            ) : (
              <div className="grid h-[360px] place-items-center rounded-[1.5rem] border bg-[#f4f3ee] p-6 text-center shadow-xl shadow-black/5" style={borderStyle}>
                <div>
                  <MapPin className="mx-auto" style={primaryTextStyle} />
                  <p className="mt-4 font-display text-2xl font-black" style={primaryTextStyle}>Ubicacion editable</p>
                  <p className="mt-2 text-sm font-bold text-[#52615d]">El cliente puede cargar un link o mapa desde su panel.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {faqs.length ? (
        <section className="bg-[#f4f3ee] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-sm font-black uppercase tracking-[0.18em]" style={primaryTextStyle}>{webContent.faqEtiqueta}</p>
            <h2 className="mt-4 text-center font-display text-4xl font-black" style={primaryTextStyle}>{webContent.faqTitulo}</h2>
            <div className="mt-8 grid gap-4">
              {faqs.map(([question, answer]) => (
                <article className="rounded-[1.25rem] border bg-white p-5 shadow-sm" key={question} style={borderStyle}>
                  <h3 className="font-display text-lg font-black" style={primaryTextStyle}>{question}</h3>
                  <p className="mt-2 leading-7 text-[#52615d]">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 rounded-[1.5rem] border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between" style={borderStyle}>
          <div>
            <p className="font-display text-2xl font-black" style={primaryTextStyle}>{business.nombre}</p>
            <p className="mt-2 text-sm font-semibold text-[#52615d]">{webContent.footerLegalTexto}</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black text-white" href={reservationHref} style={primaryBgStyle}>
            <CalendarCheck size={18} /> {webContent.ctaPrincipalTexto}
          </Link>
        </div>
      </footer>
    </main>
  );
}
