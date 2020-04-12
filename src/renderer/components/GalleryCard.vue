<template lang="pug">
    v-card(height="100%" @click="showPreview")
        v-skeleton-loader.loader(v-if="!getUrl(photo)" type="image" height="100%")
        v-img(v-else :src="getUrl(photo)")
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'GalleryCard',
    props: ['photo'],
    data: () => ({
        deleteDialog: false,
    }),
    computed: {
        ...mapGetters('session', [
            'getUrl',
        ]),
    },
    methods: {
        showPreview() {
            this.$store.commit('session/setPreview', this.photo);
        },
    },
};
</script>

<style>
    .v-skeleton-loader__bone {
        height: 100% !important
    }
</style>
