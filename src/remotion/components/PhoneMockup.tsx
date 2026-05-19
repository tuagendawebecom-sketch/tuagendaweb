import { interpolate, useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, scaleIn, slideX } from "./motion";

export function PhoneMockup({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();
  const step = Math.min(2, Math.floor(Math.max(0, frame - 14) / 30));
  const checkProgress = interpolate(frame, [88, 104], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        width: vertical ? 540 : 430,
        height: vertical ? 930 : 750,
        borderRadius: 58,
        backgroundColor: brand.text,
        padding: 18,
        boxShadow: "0 38px 120px rgba(18,61,58,0.32)",
        opacity: fadeIn(frame, 2, 16),
        transform: `translateX(${slideX(frame, 2, vertical ? 84 : 126, 22)}px) scale(${scaleIn(frame, 2, 0.94, 22)})`
      }}
    >
      <div style={{ height: "100%", borderRadius: 44, backgroundColor: brand.warm, padding: 30, overflow: "hidden" }}>
        <div style={{ textAlign: "center", color: brand.green, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: vertical ? 40 : 34, fontWeight: 950 }}>
          Reserva online
        </div>
        <div style={{ margin: "20px auto 0", width: 96, height: 8, borderRadius: 999, backgroundColor: "rgba(18,61,58,0.12)" }} />
        <div style={{ marginTop: 32 }}>
          {videoCopy.booking.steps.map((label, index) => {
            const active = index <= step;
            return (
              <div
                key={label}
                style={{
                  marginBottom: 18,
                  padding: vertical ? 25 : 22,
                  borderRadius: 26,
                  backgroundColor: active ? brand.green : "#ffffff",
                  color: active ? brand.warm : brand.text,
                  border: "1px solid rgba(18,61,58,0.1)",
                  boxShadow: active ? "0 18px 38px rgba(18,61,58,0.14)" : "none",
                  opacity: fadeIn(frame, 8 + index * 13, 10),
                  transform: `scale(${scaleIn(frame, 8 + index * 13, 0.96, 12)})`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: vertical ? 32 : 28,
                      height: vertical ? 32 : 28,
                      borderRadius: 999,
                      backgroundColor: active ? brand.accent : brand.mint,
                      color: brand.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: vertical ? 20 : 17,
                      fontWeight: 950
                    }}
                  >
                    {active ? "✓" : index + 1}
                  </div>
                  <div style={{ fontSize: vertical ? 28 : 23, fontWeight: 950 }}>{label}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: vertical ? 24 : 20, opacity: 0.82, fontWeight: 700 }}>
                  {index === 0 ? videoCopy.booking.service : index === 1 ? videoCopy.booking.time : videoCopy.booking.confirmed}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 22,
            padding: "19px 24px",
            borderRadius: 999,
            backgroundColor: brand.accent,
            color: brand.green,
            textAlign: "center",
            fontSize: vertical ? 28 : 24,
            fontWeight: 950,
            opacity: fadeIn(frame, 84, 12),
            transform: `scale(${scaleIn(frame, 84, 0.9, 12)})`
          }}
        >
          <span style={{ display: "inline-block", marginRight: 10, transform: `scale(${checkProgress})` }}>✓</span>
          Turno confirmado
        </div>
      </div>
    </div>
  );
}
