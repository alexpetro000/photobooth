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
    },
    actions: {
        fetchAll: {
            root: true,
            handler({ dispatch }) {
                dispatch('fetchPresets');
            },
        },
        async fetchSession({ commit }) {
            commit('setPresets', await ipc.callMain('fetch-session'));
        },
    },
};
