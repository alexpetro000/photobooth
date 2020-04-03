<template lang="pug">
    v-navigation-drawer(app clipped right permanent stateless disable-resize-watcher floating)
        v-tabs(v-model="tab" grow)
            v-tab
                v-icon mdi-move-resize
            v-tab
                v-icon mdi-flip-to-back
            v-tab
                v-icon mdi-crop
        v-tabs-items(v-model="tab")
            v-tab-item
                v-card
                    v-card-title Scale
                    v-slider.mx-3(
                        :value="this.preset.pos.scale || 1"
                        @input="throttledOnScaleChanged"
                        min="0.01"
                        step="0.01"
                        max="5" height="1em")
                v-card.mb-1
                    v-btn(block text @click="resetPos") Reset position
            v-tab-item
                v-card.my-1
                    v-card-title
                        |Keys:
                        v-spacer
                        v-btn(icon text @click="onAddGreenKeyClicked")
                            v-icon {{chromakeySelectorIcon}}
                    v-card.ma-2(v-for="(point, i) in preset.chromakey.points" :key="point.color")
                        v-btn.close-btn(icon text @click="deleteChromakeyPoint(i)")
                            v-icon mdi-close
                        v-card-text
                            v-icon.mr-3(:style="`color: ${point.color}`") mdi-square
                            |{{ point.color }}
                        v-slider.mx-3(
                            :value="point.fuzz",
                            @input="val => setPresetChromakeyPointFuzz([i, val])"
                            @end="reloadProcessed"
                            max="40" thumb-label height="1em")
                v-card.my-1
                    v-card-title Shift edge
                    v-slider.mx-3(
                        :value="preset.chromakey.shift",
                        @input="setPresetChromakeyShift"
                        @end="reloadProcessed"
                        max="10" thumb-label height="1em")
                v-card.my-1
                    v-card-title Smooth edge
                    v-slider.mx-3(
                        :value="preset.chromakey.smooth",
                        @input="setPresetChromakeySmooth"
                        @end="reloadProcessed"
                        max="20" thumb-label height="1em")
            v-tab-item
                v-card.mb-1
                    v-btn(block text @click="resetCrop") Reset crop
</template>

<script>
import { throttle } from 'lodash';
import { mapState, mapMutations, mapActions } from 'vuex';

export default {
    name: 'EditorTools',
    computed: {
        ...mapState('editor', [
            'preset',
            'mode',
        ]),
        chromakeySelectorIcon() {
            return this.mode === 'chromakey_selecting'
                ? 'mdi-plus-circle'
                : 'mdi-plus-circle-outline';
        },
    },
    data() {
        return {
            tab: null,
            throttledOnScaleChanged: throttle(this.onScaleChanged, 20),
        };
    },
    methods: {
        ...mapMutations('editor', [
            'setPresetChromakeyShift',
            'setPresetChromakeySmooth',
            'setPresetChromakeyPointFuzz',
            'assignPresetPos',
            'setMode',
        ]),

        ...mapActions('editor', [
            'resetPos',
            'resetCrop',
            'reloadProcessed',
            'deleteChromakeyPoint',
            'saveCurrentPresetAsDefault',
        ]),

        showMsg(msg) {
            this.$store.commit('setMsg', msg);
        },

        onAddGreenKeyClicked() {
            if (this.mode === 'chromakey') this.setMode('chromakey_selecting');
            else if (this.mode === 'chromakey_selecting') this.setMode('chromakey');
        },

        onScaleChanged(val) {
            this.assignPresetPos({ scale: val });
        },
    },
    watch: {
        tab() {
            switch (this.tab) {
            case 0:
                this.setMode('pos');
                break;
            case 1:
                this.setMode('chromakey');
                break;
            case 2:
                this.setMode('crop');
                break;
            default:
            }
        },
    },
};
</script>

<style>
    .v-tab {
        min-width: 10px!important;
    }
</style>
