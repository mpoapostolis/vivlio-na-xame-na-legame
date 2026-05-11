/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				bg: {
					deep: '#060302',
					near: '#0c0604',
					mid:  '#1a0e07',
					warm: '#2a1810',
				},
				gold: {
					soft:    '#c9a96a',
					mid:     '#d9b478',
					bright:  '#efddb0',
					pale:    '#f6dba1',
					deep:    '#9a6730',
					darkest: '#6e4920',
				},
				ink:   '#0a0a0a',
				paper: '#faf6ec',
			},
			fontFamily: {
				serif: ['Cormorant Garamond', 'Georgia', 'serif'],
				sans:  ['Inter', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				panel: '0 18px 50px -12px rgba(0,0,0,0.75), 0 2px 6px -2px rgba(0,0,0,0.5)',
				'inset-top': 'inset 0 6px 14px -6px rgba(0,0,0,0.9)',
				'login': '0 30px 80px -10px rgba(0,0,0,0.85)',
				'toast': '0 14px 40px -8px rgba(0,0,0,0.7)',
			},
			animation: {
				'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
			},
			keyframes: {
				pulseDot: {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 6px rgba(255,220,150,0.6)' },
					'50%':       { opacity: '0.4', boxShadow: '0 0 10px rgba(255,220,150,0.95)' },
				},
			},
		},
	},
	plugins: [],
}
