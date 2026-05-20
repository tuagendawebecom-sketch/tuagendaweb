import { CampaignTelemetry } from "@/components/CampaignTelemetry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import {
  Benefits,
  AgendaSimpleSection,
  CampaignReadinessStrip,
  Comparison,
  DemoCarousel,
  FAQ,
  FinalCTA,
  HowItWorks,
  Improvements,
  IncludedFeatures,
  PlanSelector,
  ProblemSolution,
  QuickExplanation,
  ReassuranceSection,
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
        <PlanSelector />
        <ReassuranceSection />
        <AgendaSimpleSection />
        <WebCompletaSection />
        <DemoCarousel />
        <Comparison />
        <HowItWorks />
        <Benefits />
        <IncludedFeatures />
        <Improvements />
        <FAQ />
        <LeadCaptureForm />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
