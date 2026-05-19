import Link from "next/link";
import { CalendarCheck, ExternalLink, Settings2, Users } from "lucide-react";

const modules = [
  ["Próximos turnos", CalendarCheck, "Ver reservas activas del negocio autenticado."],
  ["Servicios", Settings2, "Editar servicios, duración, precio y estado."],
  ["Personal y sucursales", Users, "Configurar quién atiende y dónde."],
  ["Link público", ExternalLink, "Copiar la agenda pública del negocio."]
] as const;

export default function PanelPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <section className="mt-8 rounded-[2rem] bg-teal p-8 text-cream shadow-soft">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gold">Panel cliente</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Administración del negocio</h1>
          <p className="mt-3 max-w-2xl leading-7 text-cream/75">
            Preparado para que owner, staff o viewer vean solo el negocio asociado a businessUsers por UID. No permite elegir otro negocio desde el cliente.
          </p>
        </section>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map(([title, Icon, text]) => (
            <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft" key={title}>
              <Icon className="text-action" size={28} />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">{title}</h2>
              <p className="mt-2 leading-7 text-ink/65">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
