import { Composition } from "remotion";
import { TuAgendaWebLandingDemo } from "./compositions/TuAgendaWebLandingDemo";
import { TuAgendaWebVideoPoster } from "./compositions/TuAgendaWebVideoPoster";
import { TuAgendaWebVerticalAd } from "./compositions/TuAgendaWebVerticalAd";
import { fps, landingDurationSeconds, verticalDurationSeconds } from "./data/videoScript";

export function RemotionRoot() {
  return (
    <>
      <Composition
        component={TuAgendaWebLandingDemo}
        durationInFrames={landingDurationSeconds * fps}
        fps={fps}
        height={1080}
        id="TuAgendaWebLandingDemo"
        width={1920}
      />
      <Composition
        component={TuAgendaWebVerticalAd}
        durationInFrames={verticalDurationSeconds * fps}
        fps={fps}
        height={1920}
        id="TuAgendaWebVerticalAd"
        width={1080}
      />
      <Composition
        component={TuAgendaWebVideoPoster}
        durationInFrames={1}
        fps={fps}
        height={1080}
        id="TuAgendaWebVideoPoster"
        width={1920}
      />
    </>
  );
}
