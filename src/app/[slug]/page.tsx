import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import { siteUrl } from "@/data/site";
import { canReserveBusiness, defaultScheduleConfig, getBusinessBySlug } from "@/lib/firebase/business";
import { getPublicBookingData } from "@/lib/firebase/reservations";
import { isValidSlug } from "@/lib/slug";

type PublicSlugPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PublicSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = isValidSlug(slug) ? await getBusinessBySlug(slug).catch(() => null) : null;

  if (!business) return {};

  return {
    title: `Reservar en ${business.nombre}`,
    description: `Reservá turno online en ${business.nombre} desde el celular.`,
    alternates: {
      canonical: `${siteUrl}/${business.slug}`
    },
    openGraph: {
      title: `Reservar en ${business.nombre}`,
      description: `Elegí servicio, día y horario para reservar en ${business.nombre}.`,
      url: `${siteUrl}/${business.slug}`
    }
  };
}

export default async function PublicSlugPage({ params }: PublicSlugPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) notFound();

  const business = await getBusinessBySlug(slug).catch(() => null);
  if (!business) notFound();

  const bookingData = await getPublicBookingData(business.id).catch(() => ({
    services: [],
    staff: [],
    branches: [],
    schedule: defaultScheduleConfig,
    availableDates: []
  }));
  const canReserve = canReserveBusiness(business);

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver a TuAgendaWeb
        </Link>
        <div className="mt-8">
          <PublicBookingFlow bookingData={bookingData} business={business} canReserve={canReserve} />
        </div>
      </div>
    </main>
  );
}
