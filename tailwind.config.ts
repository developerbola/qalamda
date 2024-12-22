import type { Config } from "tailwindcss";

export default {
  content: [
    "./sections/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    screens: {
      md: "768px",
      sm: "560px",
      xs: "480px",
      exs: "380px",
      vxs: "200px",
    },
  },
  plugins: [],
} satisfies Config;
