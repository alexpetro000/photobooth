import Vue from 'vue';

const { ipcRenderer: ipc } = require('electron-better-ipc');

let previewTimeoutId = null;

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
        getPhoto: (state) => (name) => state.session.find((p) => p.name === name),
    },

    mutations: {
        setSession(state, session) {
            state.session = session;
        },

        addPhoto(state, photo) {
            state.session.push(photo);
        },

        setPhotoPreset(state, { name, preset }) {
            // console.log('savePreset', name, JSON.stringify(preset));

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
            session.forEach((photo) => {
                dispatch('fetchPhoto', photo);
            });
        },

        async fetchPhoto({ commit }, photo) {
            commit('setPhotoUrl', {
                photo,
                url: await ipc.callMain('fetch-photo', photo).catch(console.err),
            });
        },

        deletePhoto({ commit }, photo) {
            ipc.callMain('delete-photo', photo)
                .then(() => {
                    commit('deletePhoto', photo);
                }, console.error);
        },

        async takePhoto({
            commit, dispatch, state, rootState,
        }) {
            commit('setPreview', true);
            try {
                const photo = await ipc.callMain('take-photo');
                commit('addPhoto', photo);
                await dispatch('fetchPhoto', photo);

                if (state.preview) {
                    commit('setPreview', photo);
                    clearTimeout(previewTimeoutId);
                    previewTimeoutId = setTimeout(() => {
                        if (state.preview === photo) commit('setPreview', false);
                    }, rootState.config.previewTime);
                }
            } catch (e) {
                console.error(e);
                commit('setPreview', false);
            }
        },
    },
};
