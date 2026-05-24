import { CampaignTelemetry } from "@/components/CampaignTelemetry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
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

export default function Home() {
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
