<template lang="pug">
    v-dialog(
        :value="preview"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
    )
        v-card
            v-toolbar
                v-btn(icon @click="close")
                    v-icon mdi-close
            v-img(v-if="preview !== true" :src="getUrl(preview)")
            v-row(
                v-else
                class="fill-height ma-0"
                align="center"
                justify="center"
            )
                v-progress-circular(indeterminate color="grey lighten-5")

</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'Preview',
    computed: {
        preview() {
            return this.$store.state.gallery.preview;
        },
        ...mapGetters('gallery', [
            'getUrl',
        ]),
    },
    methods: {
        close() {
            this.$store.commit('gallery/setPreview', false);
        },
    },
};
</script>

<style scoped>

</style>
