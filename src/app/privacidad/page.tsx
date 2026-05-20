import type { Metadata } from "next";
import Link from "next/link";
import { brandEmail } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Política básica de privacidad de TuAgendaWeb para consultas comerciales y agendas online."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-ink sm:px-6">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <h1 className="mt-8 font-display text-4xl font-extrabold text-teal">Privacidad</h1>
        <p className="mt-4 leading-7 text-ink/70">
          TuAgendaWeb usa los datos enviados en formularios o WhatsApp para responder consultas comerciales, preparar demos, crear agendas y coordinar la implementación del servicio solicitado.
        </p>
        <p className="mt-4 leading-7 text-ink/70">
          Los datos pueden incluir nombre, WhatsApp, email, nombre del negocio, rubro, plan de interés y datos de campaña como origen o UTM. No se venden datos a terceros.
        </p>
        <p className="mt-4 leading-7 text-ink/70">
          Para pedir corrección o eliminación de datos, escribí a <a className="font-bold text-action" href={`mailto:${brandEmail}`}>{brandEmail}</a>.
        </p>
      </article>
    </main>
  );
}
