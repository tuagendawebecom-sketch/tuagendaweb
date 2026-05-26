import type { Metadata } from "next";
import { CampaignTelemetry } from "@/components/CampaignTelemetry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PublicWebCompletePage } from "@/components/PublicWebCompletePage";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { headers } from "next/headers";
import {
  Benefits,
  AgendaFullDetailSection,
  AgendaSimpleSection,
  AudienceFitSection,
  CampaignReadinessStrip,
  Comparison,
  ConversionProofSection,
  CredibilityNotesSection,
  DemoCarousel,
  DecisionGuideSection,
  FAQ,
  FinalCTA,
  HowItWorks,
  Improvements,
  IncludedFeatures,
  LaunchOfferSection,
  PlanSelector,
  ProblemSolution,
  QuickExplanation,
  ReassuranceSection,
  StartRequirementsSection,
  NextStepsSection,
  WebCompletaSection
} from "@/components/LandingSections";
import { siteUrl } from "@/data/site";
import { canReserveBusiness, defaultScheduleConfig, getBusinessByCustomDomain, getPublicWebContent } from "@/lib/firebase/business";
import { getPublicBookingData } from "@/lib/firebase/reservations";

function isPlatformHost(host: string) {
  const normalized = host.toLowerCase().replace(/^www\./, "").split(":")[0];
  const platformHost = new URL(siteUrl).hostname.replace(/^www\./, "");
  return !normalized || normalized === platformHost || normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".vercel.app");
}

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "").split(":")[0];
}

function getBusinessIcon(logoUrl?: string) {
  if (!logoUrl || logoUrl.trim().length === 0) return undefined;
  return {
    icon: [{ url: logoUrl, type: "image/png" }],
    apple: [{ url: logoUrl, type: "image/png" }]
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";

  if (!isPlatformHost(host)) {
    const business = await getBusinessByCustomDomain(host).catch(() => null);
    if (business?.plan === "web_completa") {
      const webContent = await getPublicWebContent(business.id, business).catch(() => null);
      const domain = normalizeHost(business.customDomain || host);
      const title = `${business.nombre} | Turnos online`;
      const description =
        webContent?.heroSubtitulo || `Reservá turno online en ${business.nombre}${business.rubro ? `, ${business.rubro}` : ""}, desde el celular.`;
      const url = `https://${domain}`;

      return {
        title: {
          absolute: title
        },
        description,
        alternates: {
          canonical: url
        },
        openGraph: {
          title,
          description,
          type: "website",
          locale: "es_AR",
          url,
          siteName: business.nombre
        },
        twitter: {
          card: "summary_large_image",
          title,
          description
        },
        icons: getBusinessIcon(business.logoUrl)
      };
    }
  }

  return {
    title: {
      absolute: "TuAgendaWeb | Turnos online para tu negocio"
    },
    description: "Agenda online mensual o web completa con sistema de turnos para negocios de Tucumán y Argentina."
  };
}

export default async function Home() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";

  if (!isPlatformHost(host)) {
    const business = await getBusinessByCustomDomain(host).catch(() => null);
    if (business?.plan === "web_completa") {
      const [bookingData, webContent] = await Promise.all([
        getPublicBookingData(business.id).catch(() => ({
          services: [],
          staff: [],
          branches: [],
          schedule: defaultScheduleConfig,
          availableDates: []
        })),
        getPublicWebContent(business.id, business)
      ]);
      return (
        <PublicWebCompletePage
          bookingData={bookingData}
          business={business}
          canReserve={canReserveBusiness(business)}
          reservationHref="/reservar"
          showBackLink={false}
          showBookingSection={false}
          webContent={webContent}
        />
      );
    }
  }

  return (
    <>
      <CampaignTelemetry />
      <Header />
      <main className="overflow-x-clip" id="contenido">
        <Hero />
        <CampaignReadinessStrip />
        <LaunchOfferSection />
        <QuickExplanation />
        <ConversionProofSection />
        <ProblemSolution />
        <AudienceFitSection />
        <PlanSelector />
        <DecisionGuideSection />
        <ReassuranceSection />
        <AgendaSimpleSection />
        <AgendaFullDetailSection />
        <WebCompletaSection />
        <DemoCarousel />
        <Comparison />
        <HowItWorks />
        <StartRequirementsSection />
        <Benefits />
        <CredibilityNotesSection />
        <IncludedFeatures />
        <Improvements />
        <FAQ />
        <LeadCaptureForm />
        <NextStepsSection />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
