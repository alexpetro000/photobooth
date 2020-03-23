<template lang="pug">
    v-app
        v-app-bar(
            app
            dense
            clipped-right
        )
            v-btn(icon text @click="goBack")
                ConfirmButton(
                    icon='mdi-arrow-left',
                    question="Save changes?"
                    @confirmed="goBack(true)"
                    @canceled="goBack(false)"
                )
            v-spacer
            ConfirmButton(
                icon="mdi-delete"
                question="Delete photo?"
                @confirmed="deletePhoto"
            )
            v-btn(icon text)
                v-icon mdi-content-save
        v-navigation-drawer(
            permanent
            app
            clipped
            stateless
            floating
            right
        )
            v-tabs(v-model="tab" fixed-tabs)
                v-tab
                    v-icon mdi-flip-to-back
                v-tab
                    v-icon mdi-crop
            v-tabs-items(v-model="tab")
                v-tab-item
                    v-card.mb-1
                        v-btn(block text @click="resetPos") Reset position
                    Keys(v-model="preset.keys").my-1
                    v-card.my-1
                        v-card-title Shift edge
                        v-slider.mx-3(v-model="preset.erode" max="10" thumb-label height="1em")
                    v-card.my-1
                        v-card-title Smooth edge
                        v-slider.mx-3(v-model="preset.blur" max="20" thumb-label height="1em")

            template(v-slot:append)
                div.pa-2
                v-btn(block) Save as default
        v-content()
            Canvas(v-model="mode", :url="url" :preset="preset")
</template>

<script>
import { cloneDeep } from 'lodash';
import ConfirmButton from '../../components/ConfirmButton';
import Canvas from './Canvas';
import Keys from './Keys';

export default {
    name: 'EditorView',
    components: { ConfirmButton, Keys, Canvas },
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
    },
    data() {
        return {
            tab: null,
            mode: 'none',
            preset: {},
        };
    },
    methods: {
        resetPos() {
            this.$set(this.preset, 'pos', {});
        },
        goBack(save) {
            if (save) {
                this.$store.commit('gallery/setPhotoPreset', { name: this.photo.name, preset: this.preset });
            }
            this.$router.go(-1);
        },
        deletePhoto() {
            this.$store.dispatch('gallery/deletePhoto', { name: this.name });
            this.goBack();
        },
    },
    mounted() {
        this.preset = 'preset' in this.photo ? cloneDeep(this.photo.preset) : {};
    },
    // watch: {
    //     photo: {
    //         deep: true,
    //         handler(newVal) {
    //             console.log('WATCHER:PHOTO:', newVal);
    //             this.preset =
    //         },
    //     },
    // },
};
</script>

<style scoped>
</style>
