import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-ink sm:px-6">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <h1 className="mt-8 font-display text-4xl font-extrabold text-teal">Acceso al panel</h1>
        <p className="mt-3 leading-7 text-ink/65">
          Ingresa con el email y la contrasena que recibiste. Si sos dueno de un negocio, vas a tu panel; si sos administrador, vas al panel general.
        </p>
        <LoginForm />
        <p className="mt-4 text-xs leading-5 text-ink/50">Si es tu primer ingreso, podes cambiar la contrasena despues de entrar.</p>
      </div>

      <aside className="rounded-[2rem] bg-teal p-8 text-cream shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gold">Todavia no tenes cuenta?</p>
        <h2 className="mt-4 font-display text-3xl font-extrabold">Te preparo tu agenda online y te doy acceso al panel.</h2>
        <p className="mt-4 leading-7 text-cream/75">
          TuAgendaWeb sirve para recibir turnos desde un link, ordenar servicios, horarios, personal y sucursales, y tener reportes utiles del negocio.
        </p>
        <div className="mt-6 grid gap-3 text-sm font-bold text-cream/85">
          <p className="rounded-2xl border border-cream/15 p-4">Agenda Full desde $10.000/mes.</p>
          <p className="rounded-2xl border border-cream/15 p-4">Web completa con turnos desde $100.000 pago unico.</p>
          <p className="rounded-2xl border border-cream/15 p-4">Si ya sos cliente y no podes entrar, tambien te ayudo por WhatsApp.</p>
        </div>
        <a className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-action px-5 py-3 text-sm font-extrabold text-white" href={createWhatsAppHref(whatsappMessages.heroAgenda)} rel="noopener noreferrer" target="_blank">
          Pedir acceso por WhatsApp
        </a>
      </aside>
      </section>
    </main>
  );
}
