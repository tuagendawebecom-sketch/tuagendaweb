import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4EE",
        ink: "#1E1E1C",
        teal: "#123D3A",
        action: "#1F8A78",
        mint: "#DDEBE6",
        gold: "#E7B85A",
        paper: "#FCF9F5"
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(18, 61, 58, 0.35)",
        lift: "0 18px 36px -20px rgba(18, 61, 58, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
