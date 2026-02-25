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

    safelist: [
        // Clases dinámicas del selector de dificultad
        'border-green-500', 'bg-green-500/10', 'ring-green-500/20', 'bg-green-500', 'text-green-500',
        'border-yellow-500', 'bg-yellow-500/10', 'ring-yellow-500/20', 'bg-yellow-500', 'text-yellow-500',
        'border-red-500', 'bg-red-500/10', 'ring-red-500/20', 'bg-red-500', 'text-red-500',
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
