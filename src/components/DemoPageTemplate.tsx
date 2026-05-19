import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DemoCategory, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { DemoMockup } from "./DemoMockup";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

type DemoPageTemplateProps = Readonly<{
  demo: DemoCategory;
}>;

export function DemoPageTemplate({ demo }: DemoPageTemplateProps) {
  return (
    <>
      <header className="border-b border-ink/10 bg-cream/90 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link className="inline-flex items-center gap-2 rounded-xl text-sm font-bold text-teal hover:text-action" href="/">
            <ArrowLeft size={18} /> Volver a TuAgendaWeb
          </Link>
          <WhatsAppButton
            href={createWhatsAppHref(whatsappMessages.demo(demo.category))}
            label="Quiero una web así"
            location="demo_page"
            category={demo.slug}
          />
        </div>
      </header>

      <main id="contenido">
        <section className="px-4 py-14 sm:px-6 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-gold/25 px-4 py-2 text-sm font-extrabold text-teal">Demo para {demo.category}</p>
              <h1 className="text-balance font-display text-[2.2rem] font-extrabold leading-[1.08] text-teal sm:text-6xl">{demo.headline}</h1>
              <p className="mt-5 text-base leading-7 text-ink/70 sm:mt-6 sm:text-lg sm:leading-8">{demo.description}</p>
              <div className="mt-8">
                <WhatsAppButton
                  className="w-full sm:w-auto"
                  href={createWhatsAppHref(whatsappMessages.demo(demo.category))}
                  label={demo.cta}
                  location="demo_page"
                  category={demo.slug}
                />
              </div>
            </div>
            <DemoMockup desktopSrc={demo.desktop} mobileSrc={demo.mobile} title={demo.title} />
          </div>
        </section>

        <section className="bg-mint/55 px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-7 lg:col-span-1">
              <h2 className="font-display text-2xl font-extrabold text-teal">Servicios de ejemplo</h2>
              <div className="mt-5 grid gap-3">
                {demo.services.map((service) => (
                  <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/72" key={service}>{service}</p>
                ))}
              </div>
            </article>
            <article className="rounded-[1.5rem] bg-teal p-7 text-cream lg:col-span-2">
              <h2 className="font-display text-2xl font-extrabold">Cómo se adapta a {demo.category}</h2>
              <p className="mt-3 leading-7 text-cream/75">
                La demo combina una presentación comercial del negocio, una reserva simple desde el celular y un panel para que puedas administrar turnos, clientes, servicios y personal.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["El cliente elige servicio", "Selecciona día y horario", "Vos lo ves en el panel"].map((step) => (
                  <p className="rounded-2xl bg-cream/10 p-4 text-sm font-bold text-cream/85" key={step}>{step}</p>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-teal">Vista de reserva y panel admin</h2>
              <p className="mt-4 leading-8 text-ink/70">
                La página no intenta ser un sistema complejo. Está pensada para que el cliente reserve rápido y para que vos puedas tener ordenado lo más importante.
              </p>
              <div className="mt-6 grid gap-3">
                {demo.benefits.map((benefit) => (
                  <p className="flex gap-3 rounded-2xl border border-ink/10 bg-paper p-4 text-ink/72" key={benefit}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-action" size={20} /> {benefit}
                  </p>
                ))}
              </div>
            </div>
            <DemoMockup desktopSrc={demo.desktop} mobileSrc={demo.mobile} title={demo.title} variant="demo" />
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-ink p-8 text-center text-cream sm:p-12">
            <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Quiero una web así para mi negocio</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-cream/75">Escribime por WhatsApp, contame tu rubro y vemos cómo podría quedar tu versión.</p>
            <div className="mt-8">
              <WhatsAppButton
                href={createWhatsAppHref(whatsappMessages.demo(demo.category))}
                label="Quiero una web así para mi negocio"
                location="demo_page"
                category={demo.slug}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
