<template lang="pug">
    v-card
        v-img(:src="getUrl(photo)" @click="openEditor")
</template>

<script>
import { mapGetters } from 'vuex';
import ConfirmButton from './ConfirmButton';

export default {
    name: 'GalleryCard',
    components: { ConfirmButton },
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
        deletePhoto(photo) {
            this.$store.dispatch('session/deletePhoto', photo);
        },
        openEditor() {
            this.$router.push(`/edit/${this.photo.name}`);
        },
    },
};
</script>
