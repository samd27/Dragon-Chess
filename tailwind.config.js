import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#F97A1F',
                secondary: '#5DADE2',
                'board-light': '#E8D4A0',
                'board-dark': '#9B7653',
            },
            boxShadow: {
                'neon-orange': '0 0 20px rgba(249, 122, 31, 0.5), 0 0 40px rgba(249, 122, 31, 0.2)',
                'neon-blue': '0 0 20px rgba(93, 173, 226, 0.5), 0 0 40px rgba(93, 173, 226, 0.2)',
            },
            animation: {
                'electric-border': 'electric-border 3s linear infinite',
                'electric-gradient': 'electricGradient 3s ease infinite',
            },
            keyframes: {
                'electric-border': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'electricGradient': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
        },
    },

    plugins: [forms],
};
