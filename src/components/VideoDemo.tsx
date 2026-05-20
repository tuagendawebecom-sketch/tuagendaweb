"use client";

import { useState } from "react";
import { trackingEvents } from "@/data/site";
import { trackEvent } from "@/lib/tracking";

export function VideoDemo() {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[1.5rem] border border-dashed border-teal/25 bg-mint/50 p-6 text-center">
        <div>
          <p className="font-display text-xl font-bold text-teal">Video demo pendiente</p>
          <p className="mt-2 text-sm leading-6 text-ink/65">Renderizar con npm run remotion:render para generar /assets/videos/tuagendaweb-demo.mp4.</p>
        </div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-ink shadow-soft">
      <video
        aria-describedby="tuagendaweb-video-description"
        aria-label="Video demo comercial de TuAgendaWeb"
        className="aspect-video w-full bg-ink object-cover"
        controls
        muted
        onError={() => setUnavailable(true)}
        onPlay={() => trackEvent(trackingEvents.videoPlay, { location: "benefits_video" })}
        playsInline
        poster="/assets/videos/tuagendaweb-demo-poster.png"
        preload="metadata"
        src="/assets/videos/tuagendaweb-demo.mp4"
      />
      <figcaption className="sr-only" id="tuagendaweb-video-description">
        Video explicativo de TuAgendaWeb: problema de turnos por WhatsApp, reserva online, panel administrativo, precio base y llamada a WhatsApp.
      </figcaption>
    </figure>
  );
}
