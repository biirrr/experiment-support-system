import Vue from 'vue'
import VueRouter from 'vue-router'

import Overview from '@/views/Overview.vue'
import Pages from '@/views/Pages.vue'
import Data from '@/views/Data.vue'
import LatinSquares from '@/views/LatinSquares.vue'
import Results from '@/views/Results.vue'
import Settings from '@/views/Settings.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'overview',
        component: Overview,
    },
    {
        path: '/pages',
        name: 'pages',
        component: Pages,
    },
    {
        path: '/data',
        name: 'data',
        component: Data,
    },
    {
        path: '/latin-squares',
        name: 'latinSquares',
        component: LatinSquares,
    },
    {
        path: '/results',
        name: 'results',
        component: Results,
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings,
    },
]

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})

export default router
