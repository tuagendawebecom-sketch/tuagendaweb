import { AbsoluteFill, Sequence } from "remotion";
import { CTAEndCard } from "../components/CTAEndCard";
import { DashboardMockup } from "../components/DashboardMockup";
import { DemoCategoryCarousel } from "../components/DemoCategoryCarousel";
import { PhoneMockup } from "../components/PhoneMockup";
import { PricingCard } from "../components/PricingCard";
import { SceneContainer } from "../components/SceneContainer";
import { WhatsAppBubbles } from "../components/WhatsAppBubbles";
import { fps, videoCopy } from "../data/videoScript";

const s = (seconds: number) => seconds * fps;

export function TuAgendaWebVerticalAd() {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(4)}>
        <SceneContainer title={videoCopy.hook.title} subtitle={videoCopy.hook.subtitle} vertical>
          <WhatsAppBubbles vertical />
        </SceneContainer>
      </Sequence>
      <Sequence from={s(4)} durationInFrames={s(6)}>
        <SceneContainer title={videoCopy.booking.title} vertical>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <PhoneMockup vertical />
          </div>
        </SceneContainer>
      </Sequence>
      <Sequence from={s(10)} durationInFrames={s(6)}>
        <SceneContainer title={videoCopy.admin.title} vertical>
          <div style={{ display: "flex", justifyContent: "center", transform: "scale(0.9)", transformOrigin: "top center" }}>
            <DashboardMockup vertical />
          </div>
        </SceneContainer>
      </Sequence>
      <Sequence from={s(16)} durationInFrames={s(5)}>
        <SceneContainer title={videoCopy.demos.title} subtitle={videoCopy.demos.subtitle} vertical>
          <DemoCategoryCarousel vertical />
        </SceneContainer>
      </Sequence>
      <Sequence from={s(21)} durationInFrames={s(4)}>
        <SceneContainer align="center" vertical>
          <PricingCard vertical />
        </SceneContainer>
      </Sequence>
      <Sequence from={s(25)} durationInFrames={s(3)}>
        <SceneContainer align="center" vertical>
          <CTAEndCard vertical />
        </SceneContainer>
      </Sequence>
    </AbsoluteFill>
  );
}
