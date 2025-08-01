import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        display: [
          "Noto Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Coral & Mint Fresh Palette
        'coral-primary': '#FF6B6B',
        'coral-light': '#FF8E8E',
        'coral-dark': '#E55555',
        'mint-primary': '#4ECDC4',
        'mint-light': '#6FD9D1',
        'mint-dark': '#3BB5AD',
        'soft-blue': '#45B7D1',
        'soft-blue-light': '#6BC5D8',
        'soft-blue-dark': '#3A9BC1',
        'fresh-green': '#A8E6CF',
        'warm-orange': '#FFD93D',
        'cream': '#FFF8F0',
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow": {
          "0%": {
            "box-shadow": "0 0 5px rgba(255, 107, 107, 0.5), 0 0 10px rgba(255, 107, 107, 0.3), 0 0 15px rgba(255, 107, 107, 0.2)",
          },
          "100%": {
            "box-shadow": "0 0 10px rgba(255, 107, 107, 0.8), 0 0 20px rgba(255, 107, 107, 0.5), 0 0 30px rgba(255, 107, 107, 0.3)",
          },
        },
        "float": {
          "0%, 100%": { "transform": "translateY(0px)" },
          "50%": { "transform": "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { "background-position": "-1000px 0" },
          "100%": { "background-position": "1000px 0" },
        },
        "bounce-gentle": {
          "0%, 100%": { "transform": "translateY(0)" },
          "50%": { "transform": "translateY(-5px)" },
        },
        "fade-in-up": {
          "0%": { "opacity": "0", "transform": "translateY(20px)" },
          "100%": { "opacity": "1", "transform": "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { "opacity": "0", "transform": "translateX(20px)" },
          "100%": { "opacity": "1", "transform": "translateX(0)" },
        },
      },
      boxShadow: {
        "glow": "0 0 20px rgba(255, 107, 107, 0.5)",
        "glow-sm": "0 0 10px rgba(255, 107, 107, 0.3)",
        "glow-lg": "0 0 40px rgba(255, 107, 107, 0.6)",
        "mint-glow": "0 0 20px rgba(78, 205, 196, 0.4)",
        "premium": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "premium-sm": "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
        "premium-lg": "0 35px 60px -12px rgba(0, 0, 0, 0.35)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "inner-glow": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        "fresh": "0 4px 20px rgba(168, 230, 207, 0.3)",
      },
      backdropBlur: {
        "xs": "2px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
