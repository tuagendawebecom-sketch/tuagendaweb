type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (eventType: string, eventName: string, payload?: EventPayload) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as EventPayload;

  window.dataLayer?.push({ event: name, ...cleanPayload });
  window.gtag?.("event", name, cleanPayload);

  if (name === "whatsapp_click") {
    window.fbq?.("track", "Lead", cleanPayload);
  }

  if (name === "demo_click") {
    window.fbq?.("trackCustom", "DemoClick", cleanPayload);
  }

  if (name === "email_form_submit") {
    window.fbq?.("track", "Contact", cleanPayload);
  }
}
