import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TuAgendaWeb",
    short_name: "TuAgendaWeb",
    description: "Turnos online para negocios locales, con o sin web propia.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EE",
    theme_color: "#123D3A",
    icons: [
      {
        src: "/brand/logo-tuagendaweb.png",
        sizes: "1080x1080",
        type: "image/png"
      }
    ]
  };
}
