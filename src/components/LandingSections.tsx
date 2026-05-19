"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, ExternalLink, XCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  agendaSimpleFeatures,
  benefits,
  comparisonRows,
  demoCategories,
  extras,
  faq,
  howItWorks,
  includedFeatures,
  plans,
  problemSolution,
  quickExplanation,
  trackingEvents,
  webCompletaFeatures,
  whatsappMessages
} from "@/data/site";
import { trackEvent } from "@/lib/tracking";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { DemoMockup } from "./DemoMockup";
import { Section } from "./Section";
import { VideoDemo } from "./VideoDemo";
import { WhatsAppButton } from "./WhatsAppButton";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 }
};

export function QuickExplanation() {
  return (
    <Section>
      <div className="grid gap-5 md:grid-cols-3">
        {quickExplanation.map((item) => (
          <motion.article
            className={`rounded-[1.5rem] border border-ink/10 p-7 shadow-soft ${item.featured ? "bg-teal text-cream" : "bg-paper text-ink"}`}
            key={item.title}
            {...reveal}
          >
            <item.icon className={item.featured ? "text-gold" : "text-action"} size={34} />
            <h2 className="mt-6 font-display text-2xl font-extrabold">{item.title}</h2>
            <p className={`mt-3 leading-7 ${item.featured ? "text-cream/75" : "text-ink/65"}`}>{item.text}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export function ProblemSolution() {
  return (
    <Section
      eyebrow="El problema"
      text="TuAgendaWeb no reemplaza el trato cercano: saca el trabajo repetitivo de la conversación y deja el link listo para reservar."
      title="Organizar turnos por WhatsApp puede hacerte perder tiempo y clientes."
      tone="mint"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div className="rounded-[1.5rem] border border-ink/10 bg-paper p-7" {...reveal}>
          <h3 className="font-display text-2xl font-extrabold text-ink">Hoy pasa esto</h3>
          <div className="mt-6 grid gap-3">
            {problemSolution.before.map((item) => (
              <p className="flex gap-3 rounded-2xl bg-cream p-4 text-ink/70" key={item}>
                <XCircle className="mt-0.5 shrink-0 text-red-600" size={20} /> {item}
              </p>
            ))}
          </div>
        </motion.div>
        <motion.div className="rounded-[1.5rem] bg-teal p-7 text-cream shadow-soft" {...reveal}>
          <h3 className="font-display text-2xl font-extrabold">Con TuAgendaWeb</h3>
          <div className="mt-6 grid gap-3">
            {problemSolution.after.map((item) => (
              <p className="flex gap-3 rounded-2xl bg-cream/10 p-4 text-cream/82" key={item}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} /> {item}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

export function PlanSelector() {
  return (
    <Section id="planes" eyebrow="Planes" text="Podés empezar simple con un link de reserva mensual o pasar directo a una web completa con dominio propio." title="Elegí cómo querés empezar">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <motion.article
            className={`relative flex flex-col rounded-[1.5rem] border p-6 shadow-soft ${
              plan.featured ? "border-teal bg-teal text-cream" : "border-ink/10 bg-paper text-ink"
            }`}
            key={plan.id}
            {...reveal}
          >
            {plan.featured ? <span className="mb-4 w-fit rounded-full bg-gold px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-teal">Recomendada</span> : null}
            <h3 className="font-display text-3xl font-extrabold">{plan.name}</h3>
            <p className={`mt-3 font-display text-2xl font-extrabold ${plan.featured ? "text-gold" : "text-teal"}`}>{plan.price}</p>
            <p className={`mt-4 leading-7 ${plan.featured ? "text-cream/78" : "text-ink/65"}`}>{plan.description}</p>
            <div className="mt-6 grid gap-3">
              {plan.features.map((feature) => (
                <p className={`flex gap-2 text-sm font-semibold leading-6 ${plan.featured ? "text-cream/82" : "text-ink/68"}`} key={feature}>
                  <CheckCircle2 className={plan.featured ? "text-gold" : "text-action"} size={18} /> {feature}
                </p>
              ))}
            </div>
            <p className={`mt-5 text-sm font-semibold ${plan.featured ? "text-cream/70" : "text-ink/55"}`}>{plan.note}</p>
            <WhatsAppButton
              className="mt-6 w-full"
              href={createWhatsAppHref(plan.message)}
              label={plan.cta}
              location="pricing"
              eventName={trackingEvents.pricingCtaClick}
              variant={plan.featured ? "primary" : "dark"}
            />
            <Link className={`mt-3 text-center text-xs font-bold ${plan.featured ? "text-cream/70 hover:text-cream" : "text-ink/50 hover:text-teal"}`} href={plan.href}>
              Ver detalles del plan
            </Link>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export function AgendaSimpleSection() {
  return (
    <Section id="agenda-simple" eyebrow="Agenda Simple" title="Tu negocio puede tener su propio link de reservas." tone="mint">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div className="min-w-0 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft sm:p-7" {...reveal}>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-action">Ejemplo de link</p>
          <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3 break-all rounded-2xl bg-cream p-4 font-display text-base font-extrabold text-teal sm:text-lg">
            tuagendaweb.com.ar/agenda/victorias-estetica
            <Copy size={18} />
          </div>
          <p className="mt-5 leading-7 text-ink/68">
            Es una opción mensual para negocios que quieren empezar rápido: tus clientes entran, eligen servicio, profesional si corresponde, día y horario, cargan sus datos y confirman el turno.
          </p>
          <WhatsAppButton className="mt-6 w-full sm:w-auto" href={createWhatsAppHref(whatsappMessages.agendaSimple)} label="Consultar Agenda Simple" location="agenda_simple" />
        </motion.div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {agendaSimpleFeatures.map((feature) => (
            <div className="min-w-0 rounded-2xl border border-ink/10 bg-paper p-4" key={feature}>
              <CheckCircle2 className="text-action" size={20} />
              <p className="mt-3 break-words font-semibold leading-6 text-ink/72">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function WebCompletaSection() {
  return (
    <Section id="web-completa" eyebrow="Web Completa" text="No compite con Agenda Simple: es la opción premium cuando querés que tu negocio tenga presencia propia y más profesional." title="Cuando querés verte más profesional, te preparo una web completa.">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <DemoMockup desktopSrc="/assets/hero/barberia-hero-desktop.png" mobileSrc="/assets/hero/barberia-hero-mobile.png" title="Web Completa" />
        <motion.div className="rounded-[1.5rem] bg-teal p-7 text-cream shadow-soft" {...reveal}>
          <p className="font-display text-4xl font-extrabold">$100.000 pago único</p>
          <p className="mt-4 leading-7 text-cream/78">Tu propia web con dominio, landing personalizada, sistema de turnos y panel administrativo.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {webCompletaFeatures.map((feature) => (
              <p className="flex gap-2 text-sm font-semibold leading-6 text-cream/82" key={feature}>
                <CheckCircle2 className="text-gold" size={18} /> {feature}
              </p>
            ))}
          </div>
          <WhatsAppButton className="mt-7" href={createWhatsAppHref(whatsappMessages.webCompleta)} label="Consultar Web Completa" location="web_completa" />
        </motion.div>
      </div>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section id="como-funciona" eyebrow="Proceso" text="Tres pasos simples para que el cliente reserve y vos mantengas el control." title="Cómo funciona">
      <div className="grid gap-5 md:grid-cols-3">
        {howItWorks.map((step, index) => (
          <motion.article className="rounded-[1.5rem] border border-ink/10 bg-paper p-7" key={step.title} {...reveal}>
            <div className="flex items-center justify-between">
              <step.icon className="text-action" size={34} />
              <span className="font-display text-5xl font-extrabold text-mint">{index + 1}</span>
            </div>
            <h3 className="mt-6 font-display text-2xl font-extrabold text-teal">{step.title}</h3>
            <p className="mt-3 leading-7 text-ink/65">{step.text}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export function DemoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false, loop: true });

  return (
    <Section id="demos" eyebrow="Demos por rubro" text="Cada demo muestra cómo podría sentirse una agenda o web adaptada a la forma de trabajar de cada negocio." title="Mirá cómo se adapta a tu rubro">
      <div className="mb-4 flex justify-end gap-2 sm:mb-5">
        <button aria-label="Demo anterior" className="rounded-full border border-ink/10 bg-paper p-3 text-teal shadow-soft transition hover:bg-mint" onClick={() => emblaApi?.scrollPrev()} type="button">
          <ArrowLeft size={18} />
        </button>
        <button aria-label="Demo siguiente" className="rounded-full border border-ink/10 bg-paper p-3 text-teal shadow-soft transition hover:bg-mint" onClick={() => emblaApi?.scrollNext()} type="button">
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="overflow-hidden py-2" ref={emblaRef}>
        <div className="-ml-4 flex">
          {demoCategories.map((demo) => (
            <article className="ml-4 flex min-w-0 flex-[0_0_100%] flex-col rounded-[1.5rem] border border-ink/10 bg-paper p-4 shadow-soft sm:flex-[0_0_calc(50%-0.5rem)] sm:p-5 lg:flex-[0_0_calc(33.333%-0.75rem)]" key={demo.slug}>
              <DemoMockup className={`bg-gradient-to-br ${demo.palette}`} desktopSrc={demo.desktop} mobileSrc={demo.mobile} title={demo.title} variant="card" />
              <h3 className="mt-5 font-display text-2xl font-extrabold text-teal">{demo.title}</h3>
              <p className="mt-2 min-h-[88px] flex-1 leading-7 text-ink/65">{demo.commercialDescription}</p>
              <Link
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream transition hover:bg-action"
                href={`/demos/${demo.slug}`}
                onClick={() => trackEvent(trackingEvents.demoClick, { category: demo.slug, href: `/demos/${demo.slug}` })}
              >
                Ver demo
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Comparison() {
  return (
    <Section id="precios" eyebrow="Comparativa" title="Agenda Simple, Agenda Pro o Web Completa" tone="mint">
      <div className="overflow-x-auto rounded-[1.5rem] border border-ink/10 bg-paper shadow-soft">
        <div className="min-w-[720px]">
        <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-b border-ink/10 bg-teal px-4 py-4 text-sm font-extrabold text-cream">
          <span>Incluye</span>
          <span>Agenda Simple</span>
          <span>Agenda Pro</span>
          <span>Web Completa</span>
        </div>
        {comparisonRows.map((row) => (
          <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] gap-2 border-b border-ink/10 px-4 py-4 text-sm last:border-b-0" key={row[0]}>
            {row.map((cell, index) => (
              <span className={index === 0 ? "font-bold text-teal" : "text-ink/68"} key={cell}>
                {cell}
              </span>
            ))}
          </div>
        ))}
        </div>
      </div>
    </Section>
  );
}

export function IncludedFeatures() {
  return (
    <Section id="incluye" eyebrow="Web Completa" text="La base premium está pensada para lanzar rápido, vender mejor y dejar ordenado lo esencial." title="Qué incluye la Web Completa" tone="mint">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {includedFeatures.map(([label, Icon]) => (
          <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-4" key={label}>
            <Icon className="shrink-0 text-action" size={20} />
            <span className="font-semibold text-ink/75">{label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Benefits() {
  return (
    <Section eyebrow="Beneficios" title="Lo que cambia en el día a día">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(([label, Icon]) => (
          <motion.div className="rounded-[1.5rem] border border-ink/10 bg-paper p-6" key={label} {...reveal}>
            <Icon className="text-action" size={28} />
            <p className="mt-4 font-display text-xl font-extrabold text-teal">{label}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-8">
        <VideoDemo />
      </div>
    </Section>
  );
}

export function Pricing() {
  return <PlanSelector />;
}

function ExtrasColumn({ title, items, note }: { title: string; items: ReadonlyArray<readonly [string, LucideIcon]>; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
      <h3 className="font-display text-2xl font-extrabold text-teal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/60">{note}</p>
      <div className="mt-5 grid gap-3">
        {items.map(([label, Icon]) => (
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-3" key={label}>
            <Icon className="text-action" size={20} />
            <span className="text-sm font-bold text-ink/72">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Improvements() {
  return (
    <Section eyebrow="Extras y mejoras" text="No prometemos como activo algo que no esté implementado. Las mejoras se separan por estado para vender con claridad." title="Qué está disponible y qué queda para etapas futuras">
      <div className="grid gap-5 lg:grid-cols-3">
        <ExtrasColumn title="Disponible ahora" items={extras.available} note="Funciones que forman parte de la estructura base o del panel inicial." />
        <ExtrasColumn title="Próximamente" items={extras.upcoming} note="Módulos preparados visualmente o previstos para una fase posterior." />
        <ExtrasColumn title="A cotizar" items={extras.quoted} note="Mejoras especiales según el negocio y el alcance definido." />
      </div>
    </Section>
  );
}

export function FAQ() {
  return (
    <Section id="faq" eyebrow="Preguntas frecuentes" title="Objeciones normales, respuestas simples" tone="mint">
      <div className="grid gap-4 lg:grid-cols-2">
        {faq.map((item) => (
          <details className="group rounded-[1.5rem] border border-ink/10 bg-paper p-6" key={item.question}>
            <summary className="cursor-pointer list-none font-display text-xl font-extrabold text-teal">{item.question}</summary>
            <p className="mt-3 leading-7 text-ink/65">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCTA() {
  return (
    <Section>
      <div className="rounded-[2rem] bg-ink p-8 text-center text-cream shadow-soft sm:p-12">
        <p className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Empezá a recibir turnos online de una forma más ordenada.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <WhatsAppButton eventName={trackingEvents.finalCtaClick} href={createWhatsAppHref(whatsappMessages.agendaSimple)} label="Consultar por Agenda Simple" location="final_cta" />
          <WhatsAppButton eventName={trackingEvents.finalCtaClick} href={createWhatsAppHref(whatsappMessages.webCompleta)} label="Consultar por Web Completa" location="final_cta" variant="ghost" />
        </div>
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cream/70 hover:text-cream" href="/agenda/victorias-estetica">
          Ver ejemplo de agenda pública <ExternalLink size={16} />
        </Link>
      </div>
    </Section>
  );
}
