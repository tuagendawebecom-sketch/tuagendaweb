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
          reservationHref="/reservas"
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
