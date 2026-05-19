import { AbsoluteFill, Img, staticFile } from "remotion";
import { brand } from "../data/videoScript";

function PosterDesktopMockup() {
  return (
    <div
      style={{
        width: 820,
        height: 510,
        borderRadius: 34,
        backgroundColor: "#fff",
        border: "1px solid rgba(18,61,58,0.12)",
        boxShadow: "0 36px 110px rgba(18,61,58,0.2)",
        overflow: "hidden"
      }}
    >
      <div style={{ height: 58, backgroundColor: brand.green, display: "flex", alignItems: "center", gap: 12, padding: "0 24px" }}>
        {[brand.accent, brand.mint, "#fff"].map((color) => (
          <div key={color} style={{ width: 13, height: 13, borderRadius: 999, backgroundColor: color }} />
        ))}
        <div style={{ marginLeft: 14, color: brand.warm, fontSize: 20, fontWeight: 950 }}>Panel TuAgendaWeb</div>
      </div>
      <Img src={staticFile("assets/demos/barberia-desktop.png")} style={{ width: "100%", height: "calc(100% - 58px)", objectFit: "cover" }} />
    </div>
  );
}

function PosterPhoneMockup() {
  return (
    <div
      style={{
        width: 250,
        height: 455,
        borderRadius: 44,
        backgroundColor: brand.text,
        padding: 12,
        boxShadow: "0 30px 90px rgba(18,61,58,0.28)"
      }}
    >
      <div style={{ height: "100%", borderRadius: 34, backgroundColor: brand.warm, padding: 18 }}>
        <div style={{ color: brand.green, textAlign: "center", fontSize: 22, fontWeight: 950 }}>Reserva online</div>
        {["Corte + Barba", "Martes 15:00 hs", "Turno confirmado"].map((item, index) => (
          <div
            key={item}
            style={{
              marginTop: 18,
              padding: 15,
              borderRadius: 18,
              backgroundColor: index < 2 ? brand.green : brand.accent,
              color: index < 2 ? brand.warm : brand.green,
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1.15
            }}
          >
            {index === 2 ? "✓ " : ""}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TuAgendaWebVideoPoster() {
  return (
    <AbsoluteFill style={{ backgroundColor: brand.warm, overflow: "hidden", fontFamily: "Inter, Arial, sans-serif" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(18,61,58,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18,61,58,0.05) 1px, transparent 1px)",
          backgroundSize: "96px 96px"
        }}
      />
      <div style={{ position: "absolute", right: -120, top: 120, width: 560, height: 560, borderRadius: 999, backgroundColor: "rgba(221,235,230,0.72)", filter: "blur(18px)" }} />
      <div style={{ position: "absolute", left: 120, top: 86, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 62, height: 62, borderRadius: 18, backgroundColor: brand.green, color: brand.warm, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 950 }}>
          TW
        </div>
        <div style={{ color: brand.green, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: 34, fontWeight: 950 }}>TuAgendaWeb</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 206 }}>
        <h1 style={{ margin: 0, maxWidth: 760, color: brand.green, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: 84, lineHeight: 1, letterSpacing: "-0.04em" }}>
          Web propia + turnos online
        </h1>
        <p style={{ margin: "30px 0 0", maxWidth: 650, color: brand.text, fontSize: 34, lineHeight: 1.25, fontWeight: 750 }}>
          Una demo clara para ver cómo tus clientes reservan y vos administrás todo.
        </p>
      </div>
      <div style={{ position: "absolute", right: 125, bottom: 165 }}>
        <PosterDesktopMockup />
      </div>
      <div style={{ position: "absolute", right: 114, bottom: 94 }}>
        <PosterPhoneMockup />
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 120, width: 420, height: 76, borderRadius: 24, backgroundColor: brand.action, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 950 }}>
        Ver demo
      </div>
    </AbsoluteFill>
  );
}
