/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors.js';

module.exports = {
    content: [
        'src/**/*.svelte',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--colour-primary)',
                },
                secondary: {
                    DEFAULT: 'var(--colour-secondary)',
                }
            },
            height: {
                'screen-7/10': '70vh',
                'screen-8/10': '80vh',
                'screen-9/10': '90vh',
            }
        },
    },
    plugins: [],
}
