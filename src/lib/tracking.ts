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

  window.dataLayer?.push({ event: name, ...payload });
  window.gtag?.("event", name, payload);

  if (name === "whatsapp_click") {
    window.fbq?.("track", "Lead", payload);
  }

  if (name === "demo_click") {
    window.fbq?.("trackCustom", "DemoClick", payload);
  }

  if (name === "email_form_submit") {
    window.fbq?.("track", "Contact", payload);
  }
}
