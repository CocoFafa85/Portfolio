/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-pink': '#ff379b',
                'neon-blue': '#00bfff',
                'neon-yellow': '#fffb23',
                'matrix-green': '#00ff00',
                'matrix-dark': '#003b00',
                'dark-bg': '#242424', // Matches body background
                'panel-bg': 'linear-gradient(#FFFFF2, #dfdfd4)', // Approximate mapping if needed, or use solid colors
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                montserrat: ['Montserrat Alternates', 'sans-serif'],
                medieval: ['MedievalSharp', 'cursive'],
            },
            boxShadow: {
                'neon-pink': '0 0 5px #ff379b, 0 0 20px #ff379b',
                'neon-blue': '0 0 5px #00bfff, 0 0 20px #00bfff',
            },
            dropShadow: {
                'neon-pink': '0 0 5px #ff379b',
            },
            animation: {
                'neon-blink': 'blink 6s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
                'rotate-3d': 'rotateCard 6s linear infinite',
            },
            keyframes: {
                blink: {
                    '0%, 78%, 81%, 83%, 92.5%, 100%': {
                        color: 'inherit',
                        textShadow: 'inherit'
                    },
                    '79%, 82%, 92%': {
                        color: '#5e2553',
                        textShadow: 'none'
                    }
                },
                rotateCard: {
                    '0%, 100%': { transform: 'rotateX(0deg) rotateY(0deg)' },
                    '25%': { transform: 'rotateX(10deg) rotateY(10deg)' },
                    '50%': { transform: 'rotateX(0deg) rotateY(20deg)' },
                    '75%': { transform: 'rotateX(-10deg) rotateY(10deg)' },
                }
            }
        },
    },
    plugins: [],
}
