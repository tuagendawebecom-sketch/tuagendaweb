import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  Benefits,
  AgendaSimpleSection,
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
  WebCompletaSection
} from "@/components/LandingSections";

export default function Home() {
  return (
    <>
      <Header />
      <main id="contenido">
        <Hero />
        <QuickExplanation />
        <ProblemSolution />
        <PlanSelector />
        <AgendaSimpleSection />
        <WebCompletaSection />
        <DemoCarousel />
        <Comparison />
        <HowItWorks />
        <Benefits />
        <IncludedFeatures />
        <Improvements />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
