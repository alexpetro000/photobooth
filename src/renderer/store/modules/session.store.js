import Vue from 'vue';

const { ipcRenderer: ipc } = require('electron-better-ipc');

const previewTimeoutId = null;

export default {
    namespaced: true,
    state: {
        session: [],
        urls: {},
        preview: false,
    },

    getters: {
        getUrl: (state) => (photo) => {
            switch (typeof photo) {
            case 'string':
                return state.urls[photo];
            case 'object':
                return state.urls[photo.name];
            default:
                return '';
            }
        },
        getPhoto: (state) => (name) => {
            if (typeof name === 'object' && 'name' in name) name = name.name;
            if (!state.session) return {};
            return state.session.find((p) => p.name === name);
        },
    },

    mutations: {
        setSession(state, session) {
            state.session = session;
        },

        addPhoto(state, photo) {
            state.session.push(photo);
        },

        setPhotoPreset(state, { name, preset }) {
            Vue.set(state.session.find((p) => p.name === name), 'preset', preset);
        },

        setPhotoUrl(state, { photo, url }) {
            Vue.set(state.urls, photo.name, url);
            // state.urls[] = url;
        },

        deletePhoto(state, photo) {
            state.session = state.session.filter((ph) => ph.name !== photo.name);
            delete state.urls[photo.name];
        },

        setPreview(state, status) {
            state.preview = status;
            clearTimeout(previewTimeoutId);
        },
    },

    actions: {
        fetchAll: {
            root: true,
            handler({ dispatch }) {
                dispatch('fetchSession');
            },
        },

        async fetchSession({ dispatch, commit }) {
            const session = await ipc.callMain('fetch-session');
            commit('setSession', session);
            session.forEach((photo) => dispatch('processPhoto', photo));
        },

        async processPhoto({ commit }, photo) {
            commit('setPhotoUrl', {
                photo,
                url: await ipc.callMain('process-photo', photo).catch(console.err),
            });
        },

        deletePhoto({ commit }, photo) {
            ipc.callMain('delete-photo', photo)
                .then(() => {
                    commit('deletePhoto', photo);
                }, console.error);
        },

        takePhoto({ commit }) {
            return ipc.callMain('take-photo')
                .then((photo) => {
                    commit('addPhoto', photo);
                    console.log(photo);
                    return photo;
                });
        },

        commitSession({ dispatch }) {
            ipc.callMain('commit-session').catch(console.error);
            dispatch('fetchSession');
        },
    },
};
