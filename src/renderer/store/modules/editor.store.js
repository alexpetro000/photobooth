import { merge, cloneDeep } from 'lodash';

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

        defaultPreset: undefined,
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

        assignPresetPos(state, pos) {
            state.preset.pos = { ...state.preset.pos, ...pos };
        },

        setPresetCrop(state, crop) {
            state.preset.crop = crop;
        },

        assignPresetCrop(state, crop) {
            state.preset.crop = { ...state.preset.crop, ...crop };
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

        setDefaultPreset(state, preset) {
            state.defaultPreset = leadPreset(preset);
        },

        // unused
        // setPresets(state, presets) {
        //     state.presets = presets;
        // },
    },
    actions: {
        init({
            commit, dispatch, rootGetters, state,
        }, name) {
            const photo = rootGetters['session/getPhoto'](name);
            if (!photo) {
                return;
            }
            const s = {};
            s.name = name;
            s.preset = merge(leadPreset(state.defaultPreset), leadPreset(photo.preset));
            s.originalPreset = cloneDeep(s.preset);
            s.mode = undefined;
            s.saveDialog = false;
            s.loadingDialog = true;
            commit('initState', s);

            dispatch('reloadProcessed');
        },

        resetPos({ commit }) {
            commit('setPresetPos', {});
        },

        resetCrop({ commit }) {
            commit('setPresetCrop', {});
        },

        async reloadProcessed({ commit, state }) {
            commit('setLoadingDialog', true);
            console.log('name', state.name);
            console.log('preset', state.preset);
            const url = await ipc.callMain('process-photo', {
                name: state.name,
                preset: {
                    greenKeys: state.preset.greenKeys,
                    blur: state.preset.blur,
                    erode: state.preset.erode,
                },
                tmp: true,
            }).catch(console.err);
            console.log('URL', url);
            if (url) commit('setProcessedUrl', url);
        },

        deleteGreenKey({ commit, dispatch }, i) {
            commit('deleteGreenKey', i);
            dispatch('reloadProcessed');
        },

        async savePreset({ commit, dispatch, state }) {
            const obj = { name: state.name, preset: state.preset };
            await ipc.callMain('save-preset', obj);
            commit('session/setPhotoPreset', obj, { root: true });
            dispatch('session/processPhoto', obj, { root: true });
        },

        saveCurrentPresetAsDefault({ commit, state }) {
            commit('setDefaultPreset', state.preset);
            ipc.callMain('save-default-preset', state.preset).catch(console.error);
        },

        // unused
        fetchAll: {
            root: true,
            handler({ dispatch }) {
                dispatch('fetchDefaultPreset');
            },
        },
        async fetchDefaultPreset({ commit }) {
            commit('setDefaultPreset', await ipc.callMain('fetch-default-preset'));
        },
    },
};
