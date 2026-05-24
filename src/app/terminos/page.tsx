import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos",
  description: "Condiciones comerciales básicas de TuAgendaWeb."
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-ink sm:px-6">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <h1 className="mt-8 font-display text-4xl font-extrabold text-teal">Términos comerciales básicos</h1>
        <p className="mt-4 leading-7 text-ink/70">
          TuAgendaWeb ofrece agenda online mensual y web completa con sistema de turnos. Los alcances finales se confirman por WhatsApp o reunión antes de iniciar cada trabajo.
        </p>
        <p className="mt-4 leading-7 text-ink/70">
          Los precios publicados son referencias comerciales actuales. La Web Completa se plantea como pago único inicial; mejoras posteriores se cotizan por separado.
        </p>
        <p className="mt-4 leading-7 text-ink/70">
          Agenda Full son servicios mensuales dentro de TuAgendaWeb. Si un negocio se suspende, no se eliminan sus datos por defecto.
        </p>
      </article>
    </main>
  );
}
