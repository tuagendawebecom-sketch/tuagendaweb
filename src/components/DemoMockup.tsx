import { MockupFrame } from "./MockupFrame";

type DemoMockupProps = Readonly<{
  desktopSrc: string;
  mobileSrc: string;
  title: string;
  variant?: "hero" | "card" | "demo";
  className?: string;
}>;

export function DemoMockup({ desktopSrc, mobileSrc, title, variant = "hero", className = "" }: DemoMockupProps) {
  if (variant === "card") {
    return (
      <div className={`rounded-[1.25rem] p-3 ${className}`}>
        <div className="grid min-h-[236px] grid-cols-[minmax(0,1fr)_92px] items-end gap-3 sm:min-h-[250px] sm:grid-cols-[minmax(0,1fr)_108px]">
          <MockupFrame className="w-full" label={`Captura desktop ${title}`} src={desktopSrc} type="desktop" />
          <MockupFrame className="w-full shadow-lift ring-4 ring-white/80" label={`Captura mobile ${title}`} src={mobileSrc} type="mobile" />
        </div>
      </div>
    );
  }

  if (variant === "demo") {
    return (
      <div className={`grid grid-cols-[minmax(0,1fr)_minmax(88px,0.42fr)] items-end gap-3 sm:gap-4 ${className}`}>
        <MockupFrame label={`Vista desktop ${title}`} src={desktopSrc} type="desktop" />
        <MockupFrame className="shadow-lift ring-4 ring-cream" label={`Vista mobile ${title}`} src={mobileSrc} type="mobile" />
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full max-w-[620px] rounded-[2rem] bg-mint/40 p-3 sm:p-4 lg:max-w-none ${className}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(96px,0.34fr)] items-end gap-3 sm:gap-5">
        <MockupFrame label={`Vista desktop ${title}`} src={desktopSrc} type="desktop" />
        <MockupFrame className="shadow-lift ring-4 ring-cream sm:ring-8" label={`Vista mobile ${title}`} src={mobileSrc} type="mobile" />
      </div>
      <div className="mt-3 rounded-2xl border border-ink/10 bg-paper p-3 shadow-soft sm:absolute sm:bottom-7 sm:left-7 sm:mt-0 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/50 sm:text-xs">Nueva reserva</p>
        <p className="mt-1 font-display text-sm font-extrabold text-teal sm:text-lg">Corte de pelo - 15:00 hs</p>
      </div>
    </div>
  );
}
