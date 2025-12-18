/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4CAF50',
                'primary-dark': '#388E3C',
                secondary: '#C8E6C9',
                accent: '#FFEB3B',
                earth: '#6D4C41',
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans', 'Poppins', 'sans-serif'],
            },
            animation: {
                scroll: 'scroll 40s linear infinite',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        }
    },
    plugins: [],
}
