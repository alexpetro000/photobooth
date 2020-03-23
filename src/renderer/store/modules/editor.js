import Vue from 'vue';

const { ipcRenderer: ipc } = require('electron-better-ipc');

export default {
    namespaced: true,
    state: {
        presets: [],
    },
    mutations: {
        setPresets(state, presets) {
            state.presets = presets;
        },

        setPhotoUrl(state, { photo, url }) {
            Vue.set(state.urls, photo.name, url);
            // state.urls[] = url;
        },
    },
    actions: {
        fetchAll: {
            root: true,
            handler({ dispatch }) {
                dispatch('fetchPresets');
            },
        },
        async fetchPresets({ commit }) {
            commit('setPresets', await ipc.callMain('fetch-session'));
        },
    },
};
