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
        getUrl: (state) => (photo) => state.urls[photo.name],
    },

    mutations: {
        setSession(state, session) {
            state.session = session;
        },

        addPhoto(state, photo) {
            state.session.push(photo);
        },

        setPhotoUrl(state, { photo, url }) {
            state.urls[photo.name] = url;
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
