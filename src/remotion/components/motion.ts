import { Easing, interpolate } from "remotion";

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export function fadeIn(frame: number, start = 0, duration = 18) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });
}

export function slideY(frame: number, start = 0, from = 34, duration = 22) {
  return interpolate(frame, [start, start + duration], [from, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });
}

export function slideX(frame: number, start = 0, from = 80, duration = 24) {
  return interpolate(frame, [start, start + duration], [from, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });
}

export function scaleIn(frame: number, start = 0, from = 0.92, duration = 22) {
  return interpolate(frame, [start, start + duration], [from, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });
}

export function sceneFade(frame: number, durationInFrames: number, edge = 10) {
  const enter = interpolate(frame, [0, edge], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });
  const exit = interpolate(frame, [durationInFrames - edge, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease
  });

  return Math.min(enter, exit);
}
