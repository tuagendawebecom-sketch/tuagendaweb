import Link from "next/link";
import { Copy, PauseCircle, PlusCircle, ShieldCheck } from "lucide-react";

const actions = [
  "Listar negocios",
  "Crear negocio",
  "Editar slug",
  "Cambiar plan",
  "Activar, suspender o cancelar",
  "Asignar usuario dueño",
  "Ver leads",
  "Crear datos iniciales de prueba"
];

export default function SuperAdminPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-cream shadow-soft">
            <ShieldCheck className="text-gold" size={34} />
            <h1 className="mt-5 font-display text-4xl font-extrabold">Super Admin TuAgendaWeb</h1>
            <p className="mt-4 leading-7 text-cream/72">
              Pantalla base protegible por role `superadmin`. Las operaciones reales deben ejecutarse server-side con Firebase Admin SDK y nunca desde el cliente.
            </p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-paper p-6 shadow-soft">
            <h2 className="font-display text-2xl font-extrabold text-teal">Operación mínima prevista</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <div className="flex items-center gap-3 rounded-2xl bg-cream p-4" key={action}>
                  <PlusCircle className="text-action" size={20} />
                  <span className="font-semibold text-ink/72">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
            <Copy className="text-action" size={26} />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">Link público</h2>
            <p className="mt-2 leading-7 text-ink/65">Cada negocio debe poder copiar su link `tuagendaweb.com.ar/agenda/[slug]`.</p>
          </article>
          <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
            <PauseCircle className="text-action" size={26} />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">Suspensión manual</h2>
            <p className="mt-2 leading-7 text-ink/65">Si el negocio está `suspended` o `cancelled`, la agenda pública bloquea nuevas reservas sin borrar datos.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
