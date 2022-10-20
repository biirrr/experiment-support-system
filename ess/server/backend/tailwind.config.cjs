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
                    DEFAULT: colors.emerald['400'],
                    light: colors.emerald['300'],
                    dark: colors.emerald['500'],
                },
                secondary: {
                    DEFAULT: colors.emerald['800'],
                    light: colors.emerald['700'],
                    dark: colors.emerald['900'],
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
