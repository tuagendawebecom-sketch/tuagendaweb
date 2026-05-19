import { AbsoluteFill, Sequence } from "remotion";
import { BrowserMockup } from "../components/BrowserMockup";
import { CTAEndCard } from "../components/CTAEndCard";
import { DashboardMockup } from "../components/DashboardMockup";
import { DemoCategoryCarousel } from "../components/DemoCategoryCarousel";
import { PhoneMockup } from "../components/PhoneMockup";
import { PricingCard } from "../components/PricingCard";
import { SceneContainer } from "../components/SceneContainer";
import { WhatsAppBubbles } from "../components/WhatsAppBubbles";
import { fps, sceneDurations, videoCopy } from "../data/videoScript";

const s = (seconds: number) => seconds * fps;

export function TuAgendaWebLandingDemo() {
  const hook = s(sceneDurations.hook);
  const solution = hook + s(sceneDurations.solution);
  const booking = solution + s(sceneDurations.booking);
  const admin = booking + s(sceneDurations.admin);
  const demos = admin + s(sceneDurations.demos);
  const price = demos + s(sceneDurations.price);

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(sceneDurations.hook)}>
        <SceneContainer title={videoCopy.hook.title} subtitle={videoCopy.hook.subtitle}>
          <WhatsAppBubbles />
        </SceneContainer>
      </Sequence>

      <Sequence from={hook} durationInFrames={s(sceneDurations.solution)}>
        <SceneContainer dark title={videoCopy.solution.title} subtitle={videoCopy.solution.subtitle}>
          <div style={{ position: "absolute", right: 150, bottom: 120 }}>
            <BrowserMockup />
          </div>
        </SceneContainer>
      </Sequence>

      <Sequence from={solution} durationInFrames={s(sceneDurations.booking)}>
        <SceneContainer title={videoCopy.booking.title}>
          <div style={{ position: "absolute", right: 260, bottom: 90 }}>
            <PhoneMockup />
          </div>
        </SceneContainer>
      </Sequence>

      <Sequence from={booking} durationInFrames={s(sceneDurations.admin)}>
        <SceneContainer title={videoCopy.admin.title} subtitle={videoCopy.admin.subtitle}>
          <div style={{ position: "absolute", right: 120, bottom: 130 }}>
            <DashboardMockup />
          </div>
        </SceneContainer>
      </Sequence>

      <Sequence from={admin} durationInFrames={s(sceneDurations.demos)}>
        <SceneContainer title={videoCopy.demos.title} subtitle={videoCopy.demos.subtitle}>
          <div style={{ marginTop: 10 }}>
            <DemoCategoryCarousel />
          </div>
        </SceneContainer>
      </Sequence>

      <Sequence from={demos} durationInFrames={s(sceneDurations.price)}>
        <SceneContainer align="center" title="Una base clara para salir a vender.">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PricingCard />
          </div>
        </SceneContainer>
      </Sequence>

      <Sequence from={price} durationInFrames={s(sceneDurations.cta)}>
        <SceneContainer align="center">
          <CTAEndCard />
        </SceneContainer>
      </Sequence>
    </AbsoluteFill>
  );
}
