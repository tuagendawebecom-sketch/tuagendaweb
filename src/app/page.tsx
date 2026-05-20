import { CampaignTelemetry } from "@/components/CampaignTelemetry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import {
  Benefits,
  AgendaSimpleSection,
  AudienceFitSection,
  CampaignReadinessStrip,
  Comparison,
  CredibilityNotesSection,
  DemoCarousel,
  DecisionGuideSection,
  FAQ,
  FinalCTA,
  HowItWorks,
  Improvements,
  IncludedFeatures,
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
      <main id="contenido">
        <Hero />
        <CampaignReadinessStrip />
        <QuickExplanation />
        <ProblemSolution />
        <AudienceFitSection />
        <PlanSelector />
        <DecisionGuideSection />
        <ReassuranceSection />
        <AgendaSimpleSection />
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
