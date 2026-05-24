import Image from "next/image";
import Link from "next/link";
import { brandAssets, brandEmail, demoCategories, socialLinks, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-teal px-4 py-12 text-cream sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              alt="TuAgendaWeb"
              className="h-14 w-14 rounded-2xl object-contain"
              height={108}
              src={brandAssets.logo}
              width={108}
            />
            <p className="font-display text-2xl font-extrabold">TuAgendaWeb</p>
          </div>
          <p className="mt-4 max-w-md leading-7 text-cream/75">
            Agenda online mensual o web completa con turnos para negocios locales que quieren ordenar reservas sin perder el contacto humano.
          </p>
          <div className="mt-6">
            <WhatsAppButton href={createWhatsAppHref(whatsappMessages.heroAgenda)} label="Escribir por WhatsApp" location="footer" variant="primary" />
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-gold">Planes y demos</p>
          <div className="mb-5 grid gap-2 text-sm font-bold text-cream/80">
            <Link href="#plan-agenda-simple">Agenda Full desde $10.000</Link>
            <Link href="#plan-web-completa">Web Completa $100.000</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-cream/10 pt-5">
            {demoCategories.map((demo) => (
              <Link className="text-sm text-cream/75 hover:text-white" href={`/demos/${demo.slug}`} key={demo.slug}>
                {demo.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-gold">Contacto</p>
          <div className="grid gap-2 text-sm text-cream/75">
            <Link href={socialLinks.instagram} rel="noopener noreferrer" target="_blank">Instagram</Link>
            <Link href={socialLinks.facebook} rel="noopener noreferrer" target="_blank">Facebook</Link>
            <Link href={socialLinks.email}>{brandEmail}</Link>
            <Link href="#consultar">Consultar</Link>
            <Link href="/login">Acceso clientes</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
            <span>Tucumán, Argentina.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
