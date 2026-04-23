import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-blue-100', 'bg-blue-500', 'bg-blue-600', 'text-blue-600', 'text-blue-700',
    'bg-amber-100', 'bg-amber-400', 'text-amber-600',
    'bg-emerald-100', 'bg-emerald-500', 'text-emerald-600',
    'bg-purple-100', 'text-purple-600',
    'bg-red-400', 'bg-red-100', 'text-red-600',
  ],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
