import Vue from 'vue';
import Vuex from 'vuex';
import gallery from './modules/gallery';

const { ipcRenderer: ipc } = require('electron-better-ipc');

Vue.use(Vuex);

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        gallery,
    },
    state: {
        config: undefined,
    },
    mutations: {
        setConfig(state, config) {
            state.config = config;
        },
    },
    actions: {
        async fetchAll({ commit }) {
            commit('setConfig', await ipc.callMain('fetch-config').catch(console.error));
        },
    },
});
