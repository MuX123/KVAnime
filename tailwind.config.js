module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./*/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        cyber: {
          bg: "hsl(var(--cyber-bg))",
          grid: "hsl(var(--cyber-grid))",
          neon: "hsl(var(--cyber-neon))",
          glow: "hsl(var(--cyber-glow))",
          text: "hsl(var(--cyber-text))"
        }
      },
      boxShadow: {
        "neon-sm": "0 0 10px hsl(var(--cyber-glow) / 0.5)",
        neon: "0 0 24px hsl(var(--cyber-glow) / 0.6)",
        "neon-lg": "0 0 40px hsl(var(--cyber-glow) / 0.75)"
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(to right, hsl(var(--cyber-grid) / 0.25) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--cyber-grid) / 0.25) 1px, transparent 1px)",
        "cyber-radial": "radial-gradient(circle at center, hsl(var(--cyber-glow) / 0.2), transparent 65%)"
      }
    }
  },
  plugins: []
};
