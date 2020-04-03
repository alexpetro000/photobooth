<template lang="pug">
    v-app-bar(app dense clipped-right)
        v-btn(icon text @click="onGoBackClicked")
            v-icon mdi-arrow-left
        v-dialog(v-model="saveDialog" :max-width="300")
            v-card
                v-card-title.headline Changes not saved!
                v-card-actions
                    v-btn(text @click="saveDialog=false") Cancel
                    v-spacer
                    v-btn(text @click="goBack") Discard
        v-spacer
        v-btn(icon text @click="revertChanges")
            v-icon mdi-file-undo
        v-btn(icon text @click="applyDefaultPreset")
            v-icon mdi-content-duplicate
        ConfirmButton(icon="mdi-delete" question="Delete photo?" @confirmed="deletePhoto")
        v-menu
            template(v-slot:activator="{ on }")
                v-btn(icon text v-on="on")
                    v-icon mdi-content-save
            v-list
                v-list-item(@click="saveAsDefault")
                    v-list-item-title Save as default preset
                v-list-item(@click="saveForPhoto")
                    v-list-item-title Save only for this photo
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import ConfirmButton from './ConfirmButton';

const { arePresetsEqual } = require('../lib/helpers');


export default {
    name: 'EditorAppBar',
    components: { ConfirmButton },
    computed: {
        ...mapState('editor', [
            'name',
            'preset',
            'defaultPreset',
        ]),
        ...mapGetters('editor', [
            'photo',
        ]),
        saveDialog: {
            get() { return this.$store.state.editor.saveDialog; },
            set(value) { this.$store.commit('editor/setSaveDialog', value); },
        },
    },
    methods: {
        ...mapActions('editor', [
            'saveForPhoto',
            'saveAsDefault',
            'revertChanges',
            'applyDefaultPreset',
        ]),

        onGoBackClicked() {
            if (arePresetsEqual(this.preset, this.photo.preset)
            || arePresetsEqual(this.preset, this.defaultPreset)) {
                this.goBack();
            } else {
                this.saveDialog = true;
            }
        },

        goBack() {
            this.saveDialog = false;
            this.$router.go(-1);
        },

        deletePhoto() {
            this.$store.dispatch('session/deletePhoto', { name: this.name }).then(() => {
                this.$router.go(-1);
            });
        },
    },
};
</script>

<style scoped>

</style>
