import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import { siteUrl } from "@/data/site";
import { canReserveBusiness, defaultScheduleConfig, getBusinessByCustomDomain } from "@/lib/firebase/business";
import { getPublicBookingData } from "@/lib/firebase/reservations";

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "").split(":")[0];
}

function isPlatformHost(host: string) {
  const normalized = normalizeHost(host);
  const platformHost = normalizeHost(new URL(siteUrl).hostname);
  return !normalized || normalized === platformHost || normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".vercel.app");
}

async function getBusinessFromRequestHost() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  if (isPlatformHost(host)) return null;
  return getBusinessByCustomDomain(host).catch(() => null);
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusinessFromRequestHost();
  if (!business) {
    return {
      title: "Reservas"
    };
  }

  return {
    title: `Reservas en ${business.nombre}`,
    description: `Reservá turno online en ${business.nombre} desde el celular.`
  };
}

export default async function CustomDomainReservationPage() {
  const business = await getBusinessFromRequestHost();
  if (!business || business.plan !== "web_completa") notFound();

  const bookingData = await getPublicBookingData(business.id).catch(() => ({
    services: [],
    staff: [],
    branches: [],
    schedule: defaultScheduleConfig,
    availableDates: []
  }));

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver a {business.nombre}
        </Link>
        <div className="mt-8">
          <PublicBookingFlow bookingData={bookingData} business={business} canReserve={canReserveBusiness(business)} />
        </div>
      </div>
    </main>
  );
}
