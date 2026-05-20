"use client";

import { useEffect } from "react";
import { trackingEvents } from "@/data/site";
import { trackEvent } from "@/lib/tracking";

const depths = [25, 50, 75, 90] as const;

export function CampaignTelemetry() {
  useEffect(() => {
    const fired = new Set<number>();

    function handleScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const current = Math.round((window.scrollY / max) * 100);

      for (const depth of depths) {
        if (current >= depth && !fired.has(depth)) {
          fired.add(depth);
          trackEvent(trackingEvents.scrollDepth, { depth });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const campaignData = {
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmContent: params.get("utm_content") ?? "",
      utmTerm: params.get("utm_term") ?? ""
    };

    if (Object.values(campaignData).some(Boolean)) {
      sessionStorage.setItem("tuagendaweb_campaign", JSON.stringify(campaignData));
    }
  }, []);

  return null;
}
