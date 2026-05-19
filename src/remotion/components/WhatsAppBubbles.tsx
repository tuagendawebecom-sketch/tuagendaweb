import { useCurrentFrame } from "remotion";
import { brand, videoCopy } from "../data/videoScript";
import { fadeIn, slideX, slideY } from "./motion";

export function WhatsAppBubbles({ vertical = false }: Readonly<{ vertical?: boolean }>) {
  const frame = useCurrentFrame();
  const positions = vertical
    ? [
        [42, 80],
        [252, 194],
        [22, 318],
        [300, 448],
        [88, 590]
      ]
    : [
        [1010, 74],
        [1220, 204],
        [980, 340],
        [1290, 480],
        [1100, 624]
      ];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {videoCopy.hook.bubbles.map((bubble, index) => {
        const start = index * 4;
        const chaos = Math.sin((frame + index * 15) / 8) * (index % 2 ? 8 : -8);
        return (
          <div
            key={bubble}
            style={{
              position: "absolute",
              left: positions[index][0],
              top: positions[index][1],
              width: vertical ? 446 : 430,
              padding: vertical ? "27px 30px" : "25px 30px",
              borderRadius: 32,
              backgroundColor: index % 2 === 0 ? "#ffffff" : brand.mint,
              border: "1px solid rgba(18,61,58,0.14)",
              boxShadow: "0 28px 80px rgba(18,61,58,0.14)",
              opacity: fadeIn(frame, start, 7),
              transform: `translate(${slideX(frame, start, index % 2 ? 70 : -70, 14) + chaos}px, ${slideY(frame, start, 22, 14)}px) rotate(${chaos / 5}deg)`
            }}
          >
            <p style={{ margin: 0, color: brand.text, fontSize: vertical ? 32 : 31, fontWeight: 900, lineHeight: 1.15 }}>{bubble}</p>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          right: vertical ? 96 : 176,
          bottom: vertical ? 128 : 106,
          padding: vertical ? "20px 26px" : "18px 24px",
          borderRadius: 999,
          backgroundColor: brand.green,
          color: brand.warm,
          fontSize: vertical ? 26 : 24,
          fontWeight: 950,
          opacity: fadeIn(frame, 20, 12),
          transform: `translateY(${slideY(frame, 20, 20, 12)}px)`
        }}
      >
        Agenda ordenada en un link
      </div>
    </div>
  );
}
