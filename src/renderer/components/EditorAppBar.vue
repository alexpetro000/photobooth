<template lang="pug">
    v-app-bar(app dense clipped-right)
        v-btn(icon text @click="onGoBackClicked")
            v-icon mdi-arrow-left
        v-dialog(v-model="saveDialog" :max-width="300")
            v-card
                v-card-title.headline Save changes?
                v-card-actions
                    v-btn(text @click="goBack(false)") Discard
                    v-spacer
                    v-btn(text @click="goBack(true)") Save
        v-spacer
        ConfirmButton(icon="mdi-delete" question="Delete photo?" @confirmed="deletePhoto")
        v-btn(icon text)
            v-icon mdi-content-save
</template>

<script>
import { mapState } from 'vuex';
import ConfirmButton from './ConfirmButton';

const { arePresetsEqual } = require('../lib/helpers');


export default {
    name: 'EditorAppBar',
    components: { ConfirmButton },
    computed: {
        ...mapState('editor', [
            'name',
            'originalPreset',
        ]),
        saveDialog: {
            get() { return this.$store.state.editor.saveDialog; },
            set(value) { this.$store.commit('editor/setSaveDialog', value); },
        },
    },
    methods: {
        onGoBackClicked() {
            if (arePresetsEqual(this.preset, this.originalPreset)) {
                this.goBack(false);
            } else {
                this.saveDialog = true;
            }
        },
        goBack(save) {
            this.saveDialog = false;
            if (save) {
                this.$store.dispatch('editor/savePreset', { name: this.name, preset: this.preset });
            }
            this.$router.go(-1);
        },

        deletePhoto() {
            this.$store.dispatch('session/deletePhoto', { name: this.name });
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>

</style>
