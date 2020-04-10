<template lang="pug">
    v-dialog(
        :value="preview"
        fullscreen
        transition="dialog-bottom-transition"
    )
        v-card.card
            v-toolbar.toolbar()
                v-btn(text icon @click="close")
                    v-icon mdi-close
                v-spacer
                ConfirmButton(icon="mdi-delete" question="Delete photo?" @confirmed="deletePhoto")
                v-btn(text icon @click="openEditor")
                    v-icon mdi-image-edit
            div.image-container
                img.image(
                    v-if="preview !== true"
                    :src="getUrl(preview)"
                )
                v-row.flex-grow-1(
                    v-if="preview === true"
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                )
                    v-progress-circular(indeterminate color="grey lighten-5")

</template>

<script>
import { mapGetters, mapState } from 'vuex';
import ConfirmButton from './ConfirmButton';

export default {
    name: 'GalleryPreview',
    components: { ConfirmButton },
    computed: {
        ...mapState('session', [
            'preview',
        ]),
        ...mapGetters('session', [
            'getUrl',
        ]),
    },
    methods: {
        close() {
            this.$store.commit('session/setPreview', false);
        },
        deletePhoto() {
            this.$store.dispatch('session/deletePhoto', this.preview);
            this.close();
        },
        openEditor() {
            this.$router.push(`/edit/${this.preview.name}`);
        },
    },
};
</script>

<style scoped>
    .card {
        position: absolute;
        top: 0;
        bottom: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .toolbar {
        flex-grow: 0;
        flex-shrink: 0;
    }

    .image-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        position: relative;
    }

    .image {
        flex: 0 0 auto;
        vertical-align: bottom;
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
</style>
