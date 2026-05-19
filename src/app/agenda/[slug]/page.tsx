import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CalendarCheck, MessageCircle } from "lucide-react";
import { canReserveBusiness, getBusinessBySlug, getPublicServices } from "@/lib/firebase/business";
import { isValidSlug } from "@/lib/slug";

type AgendaPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({ params }: AgendaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = isValidSlug(slug) ? await getBusinessBySlug(slug) : null;

  if (!business) return {};

  return {
    title: `Agenda de ${business.nombre}`,
    description: `Reservá turno online en ${business.nombre} desde el celular.`
  };
}

export default async function AgendaPage({ params }: AgendaPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const services = await getPublicServices(business.id);
  const canReserve = canReserveBusiness(business);
  const whatsappHref = business.whatsapp ? `https://wa.me/${business.whatsapp}` : "#";

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver a TuAgendaWeb
        </Link>
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[2rem] bg-teal p-8 text-cream shadow-soft">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-cream font-display text-3xl font-extrabold text-teal">
              {business.logoUrl ? "Logo" : business.initials ?? business.nombre.slice(0, 2).toUpperCase()}
            </div>
            <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.16em] text-gold">{business.rubro ?? "Agenda online"}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{business.nombre}</h1>
            <p className="mt-4 leading-7 text-cream/78">Elegí servicio, día y horario desde el celular. La reserva queda lista para que el negocio la vea desde su panel.</p>
            {canReserve ? (
              <Link className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-action px-5 py-3 text-sm font-bold text-white shadow-lift hover:bg-ink" href={`/agenda/${business.slug}/reservar`}>
                <CalendarCheck size={18} /> Reservar turno
              </Link>
            ) : (
              <div className="mt-7 rounded-2xl bg-cream/10 p-4 text-sm font-semibold leading-6 text-cream/82">
                <AlertCircle className="mb-2 text-gold" size={20} />
                Esta agenda no está disponible temporalmente. Podés contactar al negocio por WhatsApp.
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-teal">Servicios disponibles</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div className="rounded-2xl bg-cream p-4" key={service.id}>
                    <p className="font-bold text-teal">{service.nombre}</p>
                    <p className="mt-1 text-sm text-ink/62">{service.duracionMin} min{service.precio ? ` · $${service.precio.toLocaleString("es-AR")}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-teal">Consulta rápida</h2>
              <p className="mt-2 leading-7 text-ink/65">La consulta y cancelación por celular queda preparada para activarse con la lógica migrada del turnero.</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-action" href={whatsappHref}>
                <MessageCircle size={18} /> Consultar por WhatsApp
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
