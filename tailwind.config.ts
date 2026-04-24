import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent-amber": "#e8a849",
        "accent-emerald": "#34d399",
        "accent-rose": "#f472b6",
        "accent-sky": "#60a5fa",
        "accent-orange": "#fb923c",
        "accent-teal": "#2dd4bf",
        "surface": "#0f1419",
        "surface-2": "#161d26",
        "surface-3": "#1e2832",
        "glass": "rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "signal-flow": "signalFlow 1.5s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "flicker": "flicker 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        "gradient": "gradientShift 4s ease infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.5)" },
        },
        signalFlow: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.6" },
          "97%": { opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(232,168,73,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,168,73,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse at center, rgba(232,168,73,0.1) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      boxShadow: {
        "neon-amber": "0 0 20px rgba(232,168,73,0.35), 0 0 60px rgba(232,168,73,0.12)",
        "neon-emerald": "0 0 20px rgba(52,211,153,0.35), 0 0 60px rgba(52,211,153,0.12)",
        "neon-rose": "0 0 20px rgba(244,114,182,0.35), 0 0 60px rgba(244,114,182,0.12)",
        "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backdropBlur: {
        "xs": "2px",
      },
    },
  },
  plugins: [],
};
export default config;
