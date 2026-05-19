import { useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, scaleIn, slideY } from "./motion";

export function DashboardMockup({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: vertical ? 910 : 1080,
        borderRadius: 36,
        backgroundColor: "#fff",
        border: "1px solid rgba(18,61,58,0.12)",
        boxShadow: "0 38px 110px rgba(18,61,58,0.2)",
        overflow: "hidden",
        opacity: fadeIn(frame, 4, 14),
        transform: `translateY(${slideY(frame, 4, 32, 18)}px) scale(${scaleIn(frame, 4, 0.97, 18)})`
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: vertical ? 570 : 540 }}>
        <aside style={{ backgroundColor: brand.green, padding: 30, color: brand.warm }}>
          <div style={{ fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: 30, fontWeight: 950 }}>TuAgendaWeb</div>
          {["Agenda", "Clientes", "Servicios", "Personal"].map((item, index) => (
            <div
              key={item}
              style={{
                marginTop: index === 0 ? 42 : 18,
                padding: "16px 18px",
                borderRadius: 18,
                backgroundColor: index === 0 ? "rgba(247,244,238,0.16)" : "transparent",
                fontSize: 22,
                fontWeight: 850,
                opacity: 0.9
              }}
            >
              {item}
            </div>
          ))}
        </aside>
        <main style={{ padding: 34, backgroundColor: brand.paper }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: brand.muted, fontSize: 20, fontWeight: 850, textTransform: "uppercase", letterSpacing: 2 }}>Panel administrativo</div>
              <div style={{ color: brand.green, fontSize: 46, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontWeight: 950 }}>Turnos de hoy</div>
            </div>
            <div style={{ borderRadius: 20, backgroundColor: brand.accent, color: brand.green, padding: "18px 22px", fontSize: 24, fontWeight: 950 }}>15:00 confirmado</div>
          </div>
          <p style={{ margin: "16px 0 0", color: brand.muted, fontSize: 24, fontWeight: 700 }}>{videoCopy.admin.subtitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 30 }}>
            {videoCopy.admin.cards.slice(0, 3).map((item, index) => (
              <div
                key={item}
                style={{
                  minHeight: 136,
                  borderRadius: 24,
                  backgroundColor: index === 0 ? brand.green : "#fff",
                  color: index === 0 ? brand.warm : brand.text,
                  padding: 24,
                  boxShadow: index === 0 ? "0 22px 50px rgba(18,61,58,0.16)" : "0 16px 40px rgba(18,61,58,0.06)",
                  opacity: fadeIn(frame, 14 + index * 7, 10),
                  transform: `translateY(${slideY(frame, 14 + index * 7, 24, 12)}px) scale(${scaleIn(frame, 14 + index * 7, 0.96, 12)})`
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 950, lineHeight: 1.1 }}>{item}</div>
                <div style={{ marginTop: 18, fontSize: 42, fontWeight: 950 }}>{index === 0 ? "12" : index === 1 ? "48" : "9"}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
            {videoCopy.admin.cards.slice(3).map((item, index) => (
              <div
                key={item}
                style={{
                  borderRadius: 24,
                  backgroundColor: index === 1 ? brand.mint : "#fff",
                  padding: 24,
                  boxShadow: "0 16px 40px rgba(18,61,58,0.06)",
                  opacity: fadeIn(frame, 38 + index * 8, 10),
                  transform: `translateY(${slideY(frame, 38 + index * 8, 24, 12)}px)`
                }}
              >
                <div style={{ color: brand.green, fontSize: 27, fontWeight: 950 }}>{item}</div>
                <div style={{ marginTop: 18, height: 18, borderRadius: 999, backgroundColor: "rgba(18,61,58,0.14)" }} />
                <div style={{ marginTop: 13, width: "72%", height: 18, borderRadius: 999, backgroundColor: "rgba(18,61,58,0.14)" }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
