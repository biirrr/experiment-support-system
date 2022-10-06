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
                    DEFAULT: colors.indigo['800'],
                    light: colors.indigo['700'],
                    dark: colors.indigo['900'],
                },
                secondary: {
                    DEFAULT: colors.fuchsia['700'],
                    light: colors.fuchsia['600'],
                    dark: colors.fuchsia['800'],
                }
            },
        },
    },
    plugins: [],
}
