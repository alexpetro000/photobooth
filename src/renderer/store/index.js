import Vue from 'vue';
import Vuex from 'vuex';
import session from './modules/session.store';
import editor from './modules/editor.store';

const { ipcRenderer: ipc } = require('electron-better-ipc');

Vue.use(Vuex);

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        session, editor,
    },
    state: {
        config: undefined,
        msg: '',
    },
    mutations: {
        setConfig(state, config) {
            state.config = config;
        },
        setMsg(state, msg) {
            state.msg = msg;
        },
    },
    actions: {
        async fetchAll({ commit }) {
            commit('setConfig', await ipc.callMain('fetch-config').catch(console.error));
        },
    },
});
