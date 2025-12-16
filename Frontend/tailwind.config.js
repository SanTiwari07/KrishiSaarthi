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
            }
        }
    },
    plugins: [],
}
