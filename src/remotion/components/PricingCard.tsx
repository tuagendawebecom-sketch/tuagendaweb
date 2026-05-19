import { useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, scaleIn, slideY } from "./motion";

export function PricingCard({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: vertical ? 840 : 1080,
        borderRadius: 44,
        backgroundColor: "#fff",
        border: "1px solid rgba(18,61,58,0.12)",
        boxShadow: "0 38px 120px rgba(18,61,58,0.24)",
        padding: vertical ? 58 : 62,
        opacity: fadeIn(frame, 2, 16),
        transform: `translateY(${slideY(frame, 2, 34, 18)}px) scale(${scaleIn(frame, 2, 0.94, 18)})`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 34 }}>
        <div>
          <div style={{ color: brand.green, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: vertical ? 86 : 96, fontWeight: 950, letterSpacing: "-0.045em", lineHeight: 0.95 }}>
            {videoCopy.pricing.title}
          </div>
          <div style={{ marginTop: 18, color: brand.muted, fontSize: vertical ? 34 : 36, fontWeight: 900 }}>{videoCopy.pricing.subtitle}</div>
        </div>
        {!vertical ? (
          <div style={{ borderRadius: 24, backgroundColor: brand.green, color: brand.warm, padding: "22px 26px", fontSize: 26, fontWeight: 950, lineHeight: 1.15 }}>
            Web propia
            <br />
            + turnos online
          </div>
        ) : null}
      </div>
      <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: vertical ? "1fr" : "1fr 1fr", gap: 18 }}>
        {videoCopy.pricing.bullets.map((bullet, index) => (
          <div
            key={bullet}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: vertical ? 31 : 29,
              fontWeight: 750,
              color: brand.text,
              opacity: fadeIn(frame, 24 + index * 6, 9),
              transform: `translateY(${slideY(frame, 24 + index * 6, 18, 10)}px)`
            }}
          >
            <span style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: brand.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", color: brand.green, fontWeight: 950, fontSize: 22 }}>✓</span>
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}
