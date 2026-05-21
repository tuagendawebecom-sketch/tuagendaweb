import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, CheckCircle2, Lock } from "lucide-react";
import { canReserveBusiness, getBusinessBySlug, getPublicServices } from "@/lib/firebase/business";
import { isValidSlug } from "@/lib/slug";

type ReservarPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamic = "force-dynamic";

const demoTimes = ["09:00", "10:00", "11:30", "15:00", "16:30", "18:00"];

export default async function ReservarPage({ params }: ReservarPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) notFound();

  const business = await getBusinessBySlug(slug).catch(() => null);
  if (!business) notFound();

  const services = await getPublicServices(business.id).catch(() => []);
  const canReserve = canReserveBusiness(business);

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href={`/agenda/${business.slug}`}>
          Volver a la agenda
        </Link>
        <section className="mt-8 rounded-[2rem] border border-ink/10 bg-paper p-5 shadow-soft sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-action">{business.nombre}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-teal">Reservá tu turno</h1>
          <p className="mt-3 leading-7 text-ink/65">Esta pantalla deja preparada la experiencia multi-negocio. La creación real de reservas se conecta con la lógica transaccional migrada del turnero.</p>

          {!canReserve ? (
            <div className="mt-6 rounded-2xl bg-gold/20 p-4 font-semibold text-teal">
              Esta agenda no está disponible temporalmente. No se permiten nuevas reservas.
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-extrabold text-teal">1. Elegí el servicio</h2>
              {services.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {services.map((service, index) => (
                    <button className={`rounded-2xl border p-4 text-left ${index === 0 ? "border-teal bg-mint" : "border-ink/10 bg-cream"}`} disabled={!canReserve} key={service.id} type="button">
                      <p className="font-bold text-teal">{service.nombre}</p>
                      <p className="mt-1 text-sm text-ink/62">{service.duracionMin} min</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-cream p-4 font-semibold text-ink/65">Todavía no hay servicios disponibles para reservar.</p>
              )}

              <h2 className="mt-8 font-display text-2xl font-extrabold text-teal">2. Elegí día y horario</h2>
              <div className="mt-4 rounded-2xl bg-cream p-4">
                <p className="font-bold text-teal">Ejemplo: martes próximo</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {demoTimes.map((time, index) => (
                    <button className={`rounded-xl border px-4 py-3 text-sm font-bold ${index === 3 ? "border-teal bg-teal text-cream" : "border-ink/10 bg-paper text-teal"}`} disabled={!canReserve} key={time} type="button">
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-[1.5rem] bg-teal p-5 text-cream">
              <CalendarCheck className="text-gold" size={28} />
              <h2 className="mt-4 font-display text-2xl font-extrabold">Resumen</h2>
              <div className="mt-5 grid gap-3 text-sm text-cream/82">
                <p className="flex gap-2"><CheckCircle2 className="text-gold" size={18} /> Servicio seleccionado</p>
                <p className="flex gap-2"><CheckCircle2 className="text-gold" size={18} /> Horario disponible</p>
                <p className="flex gap-2"><Lock className="text-gold" size={18} /> Tus datos se guardan por negocio</p>
              </div>
              <button className="mt-6 w-full rounded-2xl bg-action px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">
                Confirmar turno
              </button>
              <p className="mt-3 text-xs leading-5 text-cream/60">Botón deshabilitado hasta conectar el endpoint de reserva real migrado desde turnero-mvp.</p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
