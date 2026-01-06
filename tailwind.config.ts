import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'mono': ['JetBrains Mono', 'Share Tech Mono', 'monospace'],
				'tactical': ['Orbitron', 'sans-serif'],
				'terminal': ['Share Tech Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// DEFCON status colors
				defcon: {
					1: 'hsl(var(--defcon-1))',
					2: 'hsl(var(--defcon-2))',
					3: 'hsl(var(--defcon-3))',
					4: 'hsl(var(--defcon-4))',
					5: 'hsl(var(--defcon-5))',
				},
				// Classification colors
				classification: {
					ts: 'hsl(var(--classification-ts))',
					secret: 'hsl(var(--classification-secret))',
					confidential: 'hsl(var(--classification-confidential))',
					unclassified: 'hsl(var(--classification-unclassified))',
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-tactical': 'var(--gradient-tactical)',
				'gradient-threat': 'var(--gradient-threat)',
				'gradient-secure': 'var(--gradient-secure)',
				'gradient-hud': 'var(--gradient-hud)',
			},
			boxShadow: {
				'tactical': 'var(--shadow-tactical)',
				'threat': 'var(--shadow-threat)',
				'secure': 'var(--shadow-secure)',
				'hud': 'var(--shadow-hud)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'tactical-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'threat-pulse': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(0 85% 50% / 0.5)' },
					'50%': { boxShadow: '0 0 20px hsl(0 85% 50% / 0.8), 0 0 40px hsl(0 85% 50% / 0.4)' }
				},
				'scan-sweep': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'radar-sweep': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'tactical-pulse': 'tactical-pulse 2s ease-in-out infinite',
				'threat-pulse': 'threat-pulse 1s ease-in-out infinite',
				'scan-sweep': 'scan-sweep 2s ease-in-out infinite',
				'radar-sweep': 'radar-sweep 4s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;