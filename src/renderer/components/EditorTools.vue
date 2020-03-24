<template lang="pug">
    v-navigation-drawer(app clipped right permanent stateless floating)
        v-tabs(v-model="tab" grow)
            v-tab
                v-icon mdi-flip-to-back
            v-tab
                v-icon mdi-move-resize
            v-tab
                v-icon mdi-crop
        v-tabs-items(v-model="tab")
            v-tab-item
                v-card.my-1
                    v-card-title
                        |Keys:
                        v-spacer
                        v-btn(icon text @click="onAddGreenKeyClicked")
                            v-icon {{chromakeySelectorIcon}}
                    v-card.ma-2(v-for="(greenKey, i) in preset.greenKeys")
                        v-btn.close-btn(icon text @click="deleteGreenKey(i)")
                            v-icon mdi-close
                        v-card-text
                            v-icon.mr-3(:style="`color: ${greenKey.color}`") mdi-square
                            |{{ greenKey.color }}
                        v-slider.mx-3(
                            :value="greenKey.fuzz",
                            @input="val => setPresetGreenKeyFuzz([i, val])"
                            @end="reloadProcessed"
                            max="40" thumb-label height="1em")
                v-card.my-1
                    v-card-title Shift edge
                    v-slider.mx-3(
                        :value="preset.erode",
                        @input="setPresetErode"
                        @end="reloadProcessed"
                        max="10" thumb-label height="1em")
                v-card.my-1
                    v-card-title Smooth edge
                    v-slider.mx-3(
                        :value="preset.blur",
                        @input="setPresetBlur"
                        @end="reloadProcessed"
                        max="20" thumb-label height="1em")
            v-tab-item
                v-card.mb-1
                    v-btn(block text @click="resetPos") Reset position

        template(v-slot:append)
            div.pa-2
            v-btn(block) Save as default
</template>

<script>
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
        };
    },
    methods: {
        ...mapMutations('editor', [
            'setPresetErode',
            'setPresetBlur',
            'setPresetGreenKeyFuzz',
            'setMode',
        ]),

        ...mapActions('editor', [
            'resetPos',
            'reloadProcessed',
            'deleteGreenKey',
        ]),

        onAddGreenKeyClicked() {
            if (this.mode === 'chromakey') this.setMode('chromakey_selecting');
            else if (this.mode === 'chromakey_selecting') this.setMode('chromakey');
        },
    },
    watch: {
        tab() {
            switch (this.tab) {
            case 0:
                this.setMode('chromakey');
                break;
            case 1:
                this.setMode('pos');
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
