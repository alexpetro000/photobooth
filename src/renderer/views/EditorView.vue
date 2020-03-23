<template lang="pug">
    v-app(v-if="preset")
        v-dialog(v-model="saveDialog" :max-width="300")
            v-card
                v-card-title.headline Save changes?
                v-card-actions
                    v-btn(text @click="goBack(false)") Discard
                    v-spacer
                    v-btn(text @click="goBack(true)") Save
        v-app-bar(app dense clipped-right)
            v-btn(icon text @click="goBackClick")
                v-icon mdi-arrow-left
            v-spacer
            ConfirmButton(icon="mdi-delete" question="Delete photo?" @confirmed="deletePhoto")
            v-btn(icon text)
                v-icon mdi-content-save
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
                            v-btn(icon text @click="addGreenKeyClick")
                                v-icon {{chromakeySelectorIcon}}
                        v-card.ma-2(v-for="(key, i) in preset.greenKeys")
                            v-btn.close-btn(icon text @click="deleteGreenKey(i)")
                                v-icon mdi-close
                            v-card-text
                                v-icon.mr-3(:style="`color: ${key.color}`") mdi-square
                                |{{ key.color }}
                            v-slider.mx-3(v-model="key.fuzz", @end="reloadProcessed"
                                max="40" thumb-label height="1em")
                    v-card.my-1
                        v-card-title Shift edge
                        v-slider.mx-3(v-model="preset.erode" @end="reloadProcessed"
                            max="10" thumb-label height="1em")
                    v-card.my-1
                        v-card-title Smooth edge
                        v-slider.mx-3(v-model="preset.blur" @end="reloadProcessed"
                            max="20" thumb-label height="1em")
                v-tab-item
                    v-card.mb-1
                        v-btn(block text @click="resetPos") Reset position

            template(v-slot:append)
                div.pa-2
                v-btn(block) Save as default
        v-content()
            EditorCanvas(v-model="mode", :name="name" :preset="preset" ref="canvas")
</template>

<script>
import { cloneDeep, isEqual } from 'lodash';
import ConfirmButton from '../components/ConfirmButton';
import EditorCanvas from '../components/EditorCanvas';

function leadPreset(preset) {
    if (preset === undefined) preset = {};
    else preset = cloneDeep(preset);

    if (!('greenKeys' in preset)) preset.greenKeys = [];
    if (!('crop' in preset)) preset.crop = {};
    if (!('pos' in preset)) preset.pos = {};
    if (!('erode' in preset)) preset.erode = 0;
    if (!('blur' in preset)) preset.blur = 0;

    return preset;
}

export default {
    name: 'EditorView',
    components: { ConfirmButton, EditorCanvas },
    computed: {
        name() {
            return this.$route.params.name;
        },
        url() {
            return this.$store.getters['gallery/getUrl'](this.name);
        },
        photo() {
            return this.$store.getters['gallery/getPhoto'](this.name);
        },
        chromakeySelectorIcon() {
            return this.mode === 'chromakey_selecting' ? 'mdi-plus-circle' : 'mdi-plus-circle-outline';
        },
    },
    data() {
        return {
            saveDialog: false,
            tab: null,
            mode: undefined,
            preset: undefined,
        };
    },
    methods: {
        goBackClick() {
            if (isEqual(leadPreset(this.preset), leadPreset(this.photo.preset))) {
                this.goBack(false);
            } else {
                this.saveDialog = true;
            }
        },
        goBack(save) {
            this.saveDialog = false;
            if (save) {
                this.$store.commit('gallery/setPhotoPreset', { name: this.photo.name, preset: this.preset });
            }
            this.$router.go(-1);
        },
        deletePhoto() {
            this.$store.dispatch('gallery/deletePhoto', { name: this.name });
            this.goBack();
        },

        deleteGreenKey(i) {
            this.preset.greenKeys.splice(i, 1);
            this.reloadProcessed();
        },

        addGreenKeyClick() {
            if (this.mode === 'chromakey') this.mode = 'chromakey_selecting';
            else if (this.mode === 'chromakey_selecting') this.mode = 'chromakey';
        },

        resetPos() {
            this.$set(this.preset, 'pos', {});
        },

        reloadProcessed() {
            this.$refs.canvas.reloadProcessedImage();
        },
    },
    created() {
        if (this.photo) {
            this.preset = this.leadPreset(this.photo.preset);
        }
    },
    watch: {
        photo(newVal) {
            if (!this.preset) {
                this.preset = this.leadPreset(newVal.preset);
                console.log('mounted', newVal);
            }
        },
        tab() {
            switch (this.tab) {
            case 0:
                this.mode = 'chromakey';
                break;
            case 1:
                this.mode = 'pos';
                break;
            case 2:
                this.mode = 'crop';
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
