<template lang="pug">
    v-card
        v-img(:src="getUrl(photo)" @click="showPreview")
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
