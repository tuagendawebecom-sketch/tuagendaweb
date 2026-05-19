import { Img, staticFile, useCurrentFrame } from "remotion";
import { brand } from "../data/videoScript";
import { fadeIn, scaleIn, slideY } from "./motion";

export function BrowserMockup({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: vertical ? 860 : 960,
        height: vertical ? 590 : 590,
        borderRadius: 36,
        backgroundColor: "#fff",
        border: "1px solid rgba(18,61,58,0.12)",
        boxShadow: "0 38px 110px rgba(18,61,58,0.2)",
        overflow: "hidden",
        opacity: fadeIn(frame, 4, 16),
        transform: `translateY(${slideY(frame, 4, 38, 20)}px) scale(${scaleIn(frame, 4, 0.94, 20)})`
      }}
    >
      <div style={{ height: 66, backgroundColor: brand.green, display: "flex", alignItems: "center", gap: 14, padding: "0 30px" }}>
        {[brand.accent, brand.mint, "#ffffff"].map((color) => (
          <div key={color} style={{ width: 15, height: 15, borderRadius: 999, backgroundColor: color, opacity: 0.92 }} />
        ))}
        <div style={{ marginLeft: 20, color: brand.warm, fontSize: 24, fontWeight: 950 }}>TuAgendaWeb</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr", gap: 28, padding: 34 }}>
        <div>
          <div style={{ width: 250, height: 30, borderRadius: 999, backgroundColor: "rgba(231,184,90,0.32)" }} />
          <h2 style={{ margin: "28px 0 18px", color: brand.green, fontSize: 58, lineHeight: 1, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif" }}>
            Web propia con turnos online
          </h2>
          <p style={{ margin: 0, color: brand.muted, fontSize: 27, lineHeight: 1.32, fontWeight: 700 }}>Tus clientes reservan desde el celular y vos ordenás todo desde un panel simple.</p>
          <div style={{ marginTop: 32, width: 300, height: 64, borderRadius: 20, backgroundColor: brand.action, color: "#fff", fontSize: 24, fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Reservar por WhatsApp
          </div>
        </div>
        <div style={{ borderRadius: 30, backgroundColor: brand.mint, padding: 18, overflow: "hidden", position: "relative" }}>
          <Img
            src={staticFile("assets/demos/barberia-desktop.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 24,
              opacity: 0.92
            }}
          />
          <div style={{ position: "absolute", left: 36, bottom: 36, right: 36, borderRadius: 20, backgroundColor: "rgba(18,61,58,0.92)", color: brand.warm, padding: "18px 20px", fontSize: 23, fontWeight: 950 }}>
            Reserva online en tu propia web
          </div>
        </div>
      </div>
    </div>
  );
}
