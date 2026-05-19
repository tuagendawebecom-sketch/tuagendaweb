import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { brand } from "../data/videoScript";
import { fadeIn, scaleIn, slideY } from "./motion";

type SceneContainerProps = Readonly<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  vertical?: boolean;
}>;

export function SceneContainer({ title, subtitle, children, align = "left", dark = false, vertical = false }: SceneContainerProps) {
  const frame = useCurrentFrame();
  const textColor = dark ? brand.warm : brand.green;
  const camera = interpolate(frame, [0, 180], [1, 1.018], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? brand.green : brand.warm,
        color: dark ? brand.warm : brand.text,
        fontFamily: "Inter, Arial, sans-serif",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -30,
          backgroundImage:
            "linear-gradient(rgba(18,61,58,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18,61,58,0.05) 1px, transparent 1px)",
          backgroundSize: vertical ? "76px 76px" : "96px 96px",
          opacity: dark ? 0.16 : 1,
          transform: `scale(${camera})`
        }}
      />
      <div
        style={{
          position: "absolute",
          right: vertical ? -120 : -80,
          top: vertical ? 180 : 120,
          width: vertical ? 420 : 520,
          height: vertical ? 420 : 520,
          borderRadius: 999,
          backgroundColor: dark ? "rgba(231,184,90,0.12)" : "rgba(221,235,230,0.72)",
          filter: "blur(18px)",
          opacity: fadeIn(frame, 0, 16)
        }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: vertical ? "74px 64px" : "72px 106px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            position: "absolute",
            left: vertical ? 64 : 106,
            top: vertical ? 54 : 52,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: fadeIn(frame, 0, 8),
            transform: `translateY(${slideY(frame, 0, 12, 12)}px)`
          }}
        >
          <div
            style={{
              width: vertical ? 58 : 52,
              height: vertical ? 58 : 52,
              borderRadius: 16,
              backgroundColor: dark ? brand.warm : brand.green,
              color: dark ? brand.green : brand.warm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 950,
              fontSize: vertical ? 20 : 18
            }}
          >
            TW
          </div>
          <div style={{ color: textColor, fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif", fontSize: vertical ? 28 : 26, fontWeight: 950 }}>
            TuAgendaWeb
          </div>
        </div>

        {title ? (
          <div
            style={{
              textAlign: align,
              opacity: fadeIn(frame, 0, 10),
              transform: `translateY(${slideY(frame, 0, 18, 14)}px) scale(${scaleIn(frame, 0, 0.985, 14)})`,
              marginBottom: vertical ? 38 : 46
            }}
          >
            <h1
              style={{
                margin: 0,
                color: textColor,
                fontFamily: "Plus Jakarta Sans, Inter, Arial, sans-serif",
                fontSize: vertical ? 74 : 82,
                lineHeight: 1.02,
                letterSpacing: "-0.035em",
                maxWidth: vertical ? 880 : 1130,
                marginLeft: align === "center" ? "auto" : 0,
                marginRight: align === "center" ? "auto" : 0
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                style={{
                  margin: vertical ? "28px auto 0" : "26px 0 0",
                  color: dark ? "rgba(247,244,238,0.84)" : "rgba(30,30,28,0.78)",
                  fontSize: vertical ? 38 : 38,
                  fontWeight: 700,
                  lineHeight: 1.32,
                  maxWidth: vertical ? 830 : 940
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </AbsoluteFill>
  );
}
