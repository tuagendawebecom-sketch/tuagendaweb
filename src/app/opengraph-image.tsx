import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F7F4EE",
          color: "#123D3A",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%"
        }}
      >
        <div style={{ color: "#1F8A78", fontSize: 34, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>TuAgendaWeb</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginTop: 34, maxWidth: 930 }}>Turnos online para tu negocio</div>
        <div style={{ color: "#1E1E1C", fontSize: 34, lineHeight: 1.35, marginTop: 28, maxWidth: 900 }}>Agenda simple o web completa con reservas desde el celular.</div>
        <div style={{ background: "#E7B85A", borderRadius: 999, color: "#123D3A", fontSize: 30, fontWeight: 900, marginTop: 48, padding: "18px 30px", alignSelf: "flex-start" }}>
          Promo desde $10.000/mes
        </div>
      </div>
    ),
    size
  );
}
