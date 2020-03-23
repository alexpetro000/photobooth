import Vue from 'vue';
import VueRouter from 'vue-router';

import MainView from '../views/MainView';
import EditorView from '../views/EditorView';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainView,
    },
    {
        path: '/edit/:name',
        name: 'Editor',
        component: EditorView,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
