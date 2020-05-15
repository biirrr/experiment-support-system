import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Index from '@/views/Index.vue';
import QuestionTypeGroup from '@/views/QuestionTypeGroup.vue';

Vue.use(VueRouter)
const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Root',
        component: Index,
    },
    {
        path: '/question-type-groups/:qtgid',
        name: 'QuestionTypeGroup',
        component: QuestionTypeGroup,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
