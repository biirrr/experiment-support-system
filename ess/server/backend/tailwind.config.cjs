/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors.js';

module.exports = {
    content: [
        'src/**/*.svelte',
    ],
    theme: {
        extend: {
            colors: {
                primary: colors.indigo,
            },
        },
    },
    plugins: [],
}
