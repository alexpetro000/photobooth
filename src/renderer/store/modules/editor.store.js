import { merge, cloneDeep } from 'lodash';

const { ipcRenderer: ipc } = require('electron-better-ipc');
const { leadPreset, arePresetsEqual } = require('../../lib/helpers');

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
    getters: {
        photo(state, getters, rootState, rootGetters) {
            return rootGetters['session/getPhoto'](state.name);
        },
    },
    mutations: {
        initState(state, newState) {
            Object.assign(state, newState);
        },

        setName(state, name) {
            state.name = name;
        },

        setPreset(state, preset) {
            state.preset = preset;
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

        addPresetChromakeyPoint(state, greenKey) {
            state.preset.chromakey.points.unshift(greenKey || { color: '', fuzz: 0 });
        },

        deleteChromakeyPoint(state, i) {
            state.preset.chromakey.points.splice(i, 1);
        },

        setPresetChromakeyPointFuzz(state, [i, val]) {
            state.preset.chromakey.points[i].fuzz = val;
        },

        setPresetChromakeyPointColor(state, [i, val]) {
            state.preset.chromakey.points[i].color = val;
        },

        setPresetChromakeyShift(state, val) {
            state.preset.chromakey.shift = val;
        },

        setPresetChromakeySmooth(state, val) {
            state.preset.chromakey.smooth = val;
        },

        setProcessedUrl(state, url) {
            state.processedUrl = url;
        },

        setSaveDialog(state, value) {
            state.saveDialog = !!value;
        },

        setDefaultPreset(state, preset) {
            state.defaultPreset = leadPreset(preset);
        },
    },
    actions: {
        init({
            commit, dispatch, getters, state,
        }, name) {
            commit('setName', name);
            const { photo } = getters;
            if (!photo) {
                return;
            }
            const s = {};
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
                preset: { chromakey: state.preset.chromakey },
                tmp: true,
            }).catch(console.err);
            console.log('URL', url);
            if (url) commit('setProcessedUrl', url);
        },

        deleteChromakeyPoint({ commit, dispatch }, i) {
            commit('deleteChromakeyPoint', i);
            dispatch('reloadProcessed');
        },

        async saveForPhoto({ commit, dispatch, state }) {
            const obj = { name: state.name, preset: undefined };

            if (!arePresetsEqual(state.defaultPreset, state.preset)) {
                obj.preset = state.preset;
            }

            await ipc.callMain('save-preset', obj);
            commit('session/setPhotoPreset', obj, { root: true });
            dispatch('session/processPhoto', obj, { root: true })
                .then(() => commit('setMsg', 'Saved!', { root: true }));
        },

        async saveAsDefault({ commit, dispatch, state }) {
            commit('setDefaultPreset', state.preset);
            await ipc.callMain('save-default-preset', state.preset).catch(console.error)
                .then(() => commit('setMsg', 'Saved!', { root: true }));

            const obj = { name: state.name, preset: undefined };
            await ipc.callMain('save-preset', obj);
            // commit('session/setPhotoPreset', obj, { root: true });
            // dispatch('session/processPhoto', obj, { root: true });
            dispatch('session/fetchSession', null, { root: true });
        },

        revertChanges({ commit, state, dispatch }) {
            commit('setPreset', cloneDeep(state.originalPreset));
            dispatch('reloadProcessed');
        },

        applyDefaultPreset({ commit, state, dispatch }) {
            commit('setPreset', leadPreset(state.defaultPreset));
            dispatch('reloadProcessed');
        },

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
