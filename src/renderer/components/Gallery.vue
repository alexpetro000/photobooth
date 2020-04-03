<template lang="pug">
    v-container(fluid)
        v-row(dense)
            v-col(cols="4")
                GalleryTakePhotoCard
            v-col(
                v-for="photo in session.slice().reverse()"
                :key="photo.name"
                cols="4"
            )
                PhotoCard(:photo="photo")
</template>

<script>
import { mapState } from 'vuex';
import PhotoCard from './GalleryCard';
import GalleryTakePhotoCard from './GalleryTakePhotoCard';

export default {
    name: 'Gallery',
    components: {
        GalleryTakePhotoCard,
        PhotoCard,
    },
    computed: {
        ...mapState('session', [
            'session',
        ]),
    },
};
</script>

<style scoped>

</style>
