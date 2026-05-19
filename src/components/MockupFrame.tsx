"use client";

import { useEffect, useRef, useState } from "react";

type MockupFrameProps = Readonly<{
  src: string;
  label: string;
  type: "desktop" | "mobile" | "cover";
  className?: string;
  showPath?: boolean;
}>;

export function MockupFrame({ src, label, type, className = "", showPath = true }: MockupFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const isMobile = type === "mobile";
  const ratio = isMobile ? "aspect-[9/16]" : "aspect-[16/10]";
  const pendingLabel = isMobile ? "Captura mobile pendiente" : type === "desktop" ? "Captura desktop pendiente" : "Imagen demo pendiente";

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative min-w-0 overflow-hidden rounded-[1.35rem] border border-ink/10 bg-paper shadow-soft ${ratio} ${className}`}>
      <div className={`absolute inset-0 transition-opacity ${loaded ? "opacity-0" : "opacity-100"}`}>
        <div className="flex h-full w-full flex-col items-center justify-center bg-[linear-gradient(135deg,#FCF9F5,#DDEBE6)] p-3 text-center sm:p-6">
          <span className="mb-2 rounded-full bg-gold/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal sm:mb-3 sm:px-3 sm:text-xs">
            {type}
          </span>
          <p className="text-balance font-display text-sm font-bold leading-tight text-teal sm:text-lg">{pendingLabel}</p>
          {showPath ? <p className="mt-2 max-w-xs break-all text-[10px] leading-4 text-ink/55 sm:text-xs sm:leading-5">{src}</p> : null}
        </div>
      </div>
      <img
        ref={imageRef}
        alt={label}
        className={`relative h-full w-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        decoding="async"
        height={isMobile ? 1280 : 900}
        loading="lazy"
        onError={() => setLoaded(false)}
        onLoad={() => setLoaded(true)}
        src={src}
        width={isMobile ? 720 : 1440}
      />
    </div>
  );
}
