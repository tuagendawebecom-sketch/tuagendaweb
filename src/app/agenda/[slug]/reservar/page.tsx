import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import { canReserveBusiness, getBusinessBySlug, defaultScheduleConfig } from "@/lib/firebase/business";
import { getPublicBookingData } from "@/lib/firebase/reservations";
import { isValidSlug } from "@/lib/slug";

type ReservarPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamic = "force-dynamic";

export default async function ReservarPage({ params }: ReservarPageProps) {
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
        <Link className="text-sm font-bold text-teal hover:text-action" href={`/agenda/${business.slug}`}>
          Volver a la agenda
        </Link>
        <div className="mt-8">
          <PublicBookingFlow bookingData={bookingData} business={business} canReserve={canReserve} />
        </div>
      </div>
    </main>
  );
}
