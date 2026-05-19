import { interpolate, useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, scaleIn, slideY } from "./motion";

export function CTAEndCard({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [1, 1.032]);

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <div
        style={{
          margin: "0 auto 30px",
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          padding: vertical ? "18px 24px" : "16px 22px",
          borderRadius: 24,
          backgroundColor: "#fff",
          border: "1px solid rgba(18,61,58,0.12)",
          boxShadow: "0 18px 50px rgba(18,61,58,0.12)",
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 18, 14)}px)`
        }}
      >
        <div style={{ width: vertical ? 62 : 56, height: vertical ? 62 : 56, borderRadius: 18, backgroundColor: brand.green, color: brand.warm, display: "flex", alignItems: "center", justifyContent: "center", fontSize: vertical ? 22 : 19, fontWeight: 950 }}>
          TW
        </div>
        <div style={{ color: brand.green, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: vertical ? 34 : 30, fontWeight: 950 }}>{videoCopy.cta.brand}</div>
      </div>
      <h1
        style={{
          margin: "0 auto",
          maxWidth: vertical ? 900 : 1260,
          color: brand.green,
          fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif",
          fontSize: vertical ? 74 : 76,
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          opacity: fadeIn(frame, 8, 18),
          transform: `translateY(${slideY(frame, 8, 24, 18)}px)`
        }}
      >
        {videoCopy.cta.title}
      </h1>
      <div
        style={{
          margin: "42px auto 0",
          width: vertical ? 640 : 560,
          height: vertical ? 96 : 84,
          borderRadius: 26,
          backgroundColor: brand.action,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: vertical ? 32 : 30,
          fontWeight: 950,
          boxShadow: "0 24px 75px rgba(31,138,120,0.34)",
          opacity: fadeIn(frame, 28, 16),
          transform: `scale(${scaleIn(frame, 28, 0.92, 16) * pulse})`
        }}
      >
        {videoCopy.cta.button}
      </div>
    </div>
  );
}
