import Vue from 'vue';
import VueRouter from 'vue-router';

import Overview from '@/views/Overview.vue';
import Pages from '@/views/Pages.vue';
import PagesCreate from '@/views/PagesCreate.vue'
import PageEdit from '@/views/PageEdit.vue';
import PageSettings from '@/views/PageSettings.vue';
import Data from '@/views/Data.vue';
import LatinSquares from '@/views/LatinSquares.vue';
import Results from '@/views/Results.vue';
import Settings from '@/views/Settings.vue';

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
        children: [
            {
                path: 'create',
                name: 'page.create',
                component: PagesCreate,
            },
            {
                path: ':pid',
                name: 'page.edit',
                component: PageEdit,
                children: [
                    {
                        path: 'settings',
                        name: 'page.settings',
                        component: PageSettings,
                    }
                ],
            }
        ],
    },
    /*{
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
    },*/
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
