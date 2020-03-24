const { ipcRenderer: ipc } = require('electron-better-ipc');
const { leadPreset } = require('../../lib/helpers');


export default {
    namespaced: true,
    state: {
        name: undefined,
        originalPreset: undefined,
        preset: undefined,
        mode: undefined,
        saveDialog: false,
        loadingDialog: true,
        processedUrl: 'undefined',
    },
    // getters: {
    //     photo(state, getters, rootState, rootGetters) {
    //         return rootGetters['session/getPhoto'](state.name);
    //     },
    // },
    mutations: {
        initState(state, newState) {
            Object.assign(state, newState);
        },

        setMode(state, mode) {
            state.mode = mode;
        },

        setLoadingDialog(state, val) {
            state.loadingDialog = val;
        },

        setPresetPos(state, pos) {
            state.preset.pos = pos;
        },

        addPresetGreenKey(state, greenKey) {
            state.preset.greenKeys.unshift(greenKey || { color: '', fuzz: 0 });
        },

        deleteGreenKey(state, i) {
            state.preset.greenKeys.splice(i, 1);
        },

        setPresetGreenKeyFuzz(state, [i, val]) {
            state.preset.greenKeys[i].fuzz = val;
        },

        setPresetGreenKeyColor(state, [i, val]) {
            state.preset.greenKeys[i].color = val;
        },

        setPresetErode(state, val) {
            state.preset.erode = val;
        },

        setPresetBlur(state, val) {
            state.preset.blur = val;
        },

        setProcessedUrl(state, url) {
            state.processedUrl = url;
        },

        // setPresetProp(state, { prop, val }) {
        //     const propArr = prop.split('.');
        //     const lastObj = propArr.slice(0, propArr.length - 1).reduce((obj, p) => {
        //         if (!(p in obj)) Vue.$set(obj, p, {});
        //         return obj[p];
        //     }, state.preset);
        //     Vue.$set(lastObj, propArr[propArr.length - 1], val);
        // },

        setSaveDialog(state, value) {
            state.saveDialog = !!value;
        },

        // unused
        // setPresets(state, presets) {
        //     state.presets = presets;
        // },
    },
    actions: {
        init({ commit, dispatch, rootGetters }, name) {
            const photo = rootGetters['session/getPhoto'](name);
            if (!photo) {
                return;
            }
            const s = {};
            s.name = name;
            s.originalPreset = leadPreset(photo.preset);
            s.preset = leadPreset(photo.preset);
            s.mode = undefined;
            s.saveDialog = false;
            s.loadingDialog = true;
            commit('initState', s);

            dispatch('reloadProcessed');
        },

        resetPos({ commit }) {
            commit('setPresetPos', {});
        },

        async reloadProcessed({ commit, state }) {
            commit('setLoadingDialog', true);
            console.log('name', state.name);
            console.log('preset', state.preset);
            const url = await ipc.callMain('process-photo', {
                name: state.name,
                preset: state.preset,
                tmp: true,
            }).catch(console.err);
            console.log('URL', url);
            if (url) commit('setProcessedUrl', url);
        },

        deleteGreenKey({ commit, dispatch }, i) {
            commit('deleteGreenKey', i);
            dispatch('reloadProcessed');
        },

        savePreset({ commit }, preset) {
            commit('session/setPhotoPreset', preset, { root: true });
        },


        // unused
        // fetchAll: {
        //     root: true,
        //     handler({ dispatch }) {
        //         dispatch('fetchPresets');
        //     },
        // },
        // async fetchPresets({ commit }) {
        //     commit('setPresets', await ipc.callMain('fetch-session'));
        // },
    },
};
