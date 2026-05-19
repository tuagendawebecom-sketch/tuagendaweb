import { interpolate, useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, scaleIn } from "./motion";

export function DemoCategoryCarousel({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();
  const offset = interpolate(frame, [0, 150], [0, vertical ? -560 : -690], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div style={{ width: "100%", overflow: "hidden", padding: vertical ? "14px 0 30px" : "24px 0 36px" }}>
      <div style={{ display: "flex", gap: 26, transform: `translateX(${offset}px)` }}>
        {videoCopy.demos.categories.map((category, index) => {
          const active = Math.floor(frame / 24) % videoCopy.demos.categories.length === index;
          return (
            <div
              key={category.name}
              style={{
                flex: `0 0 ${vertical ? 390 : 390}px`,
                height: vertical ? 360 : 330,
                borderRadius: 32,
                backgroundColor: active ? brand.green : "#fff",
                color: active ? brand.warm : brand.green,
                border: "1px solid rgba(18,61,58,0.12)",
                padding: 30,
                boxShadow: active ? "0 30px 95px rgba(18,61,58,0.26)" : "0 20px 50px rgba(18,61,58,0.10)",
                opacity: fadeIn(frame, index * 4, 10),
                transform: `scale(${active ? 1.045 : scaleIn(frame, index * 4, 0.96, 12)})`
              }}
            >
              <div
                style={{
                  height: 112,
                  borderRadius: 26,
                  backgroundColor: active ? "rgba(247,244,238,0.13)" : brand.mint,
                  marginBottom: 30,
                  display: "grid",
                  gridTemplateColumns: "1fr 54px",
                  gap: 12,
                  padding: 16
                }}
              >
                <div style={{ borderRadius: 16, backgroundColor: active ? "rgba(247,244,238,0.22)" : "#fff" }} />
                <div style={{ borderRadius: 18, backgroundColor: active ? brand.accent : "rgba(18,61,58,0.14)" }} />
              </div>
              <div style={{ fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: 40, fontWeight: 950 }}>{category.name}</div>
              <div style={{ marginTop: 14, fontSize: 23, lineHeight: 1.28, opacity: active ? 0.82 : 0.68, fontWeight: 750 }}>{category.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
