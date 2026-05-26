import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import { PublicWebCompletePage } from "@/components/PublicWebCompletePage";
import { siteUrl } from "@/data/site";
import { canReserveBusiness, defaultScheduleConfig, getBusinessBySlug, getPublicWebContent } from "@/lib/firebase/business";
import { getPublicBookingData } from "@/lib/firebase/reservations";
import { isValidSlug } from "@/lib/slug";

type PublicSlugPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamic = "force-dynamic";

function getBusinessIcon(logoUrl?: string) {
  if (!logoUrl || logoUrl.trim().length === 0) return undefined;
  return {
    icon: [{ url: logoUrl, type: "image/png" }],
    apple: [{ url: logoUrl, type: "image/png" }]
  };
}

export async function generateMetadata({ params }: PublicSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = isValidSlug(slug) ? await getBusinessBySlug(slug).catch(() => null) : null;

  if (!business) return {};

  const isWebComplete = business.plan === "web_completa";
  const title = isWebComplete ? `${business.nombre} | Web con turnos online` : `${business.nombre} | Reservar turno`;
  const description = isWebComplete
    ? `${business.nombre}: conocé sus servicios y reservá turno online desde el celular.`
    : `Reservá turno online en ${business.nombre} desde el celular.`;

  return {
    title: {
      absolute: title
    },
    description,
    alternates: {
      canonical: `${siteUrl}/${business.slug}`
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${business.slug}`,
      siteName: business.nombre
    },
    icons: getBusinessIcon(business.logoUrl)
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

  if (business.plan === "web_completa") {
    if (business.customDomain) {
      redirect(`https://${business.customDomain}`);
    }
    const webContent = await getPublicWebContent(business.id, business).catch(() => null);
    if (webContent) {
      return <PublicWebCompletePage bookingData={bookingData} business={business} canReserve={canReserve} webContent={webContent} />;
    }
  }

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
