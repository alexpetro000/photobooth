<template lang="pug">
    v-container(fluid)
        v-row(dense)
            v-col(sm="6" md="4" lg="3")
                GalleryTakePhotoCard
            v-col(
                v-for="photo in session.slice().reverse()"
                :key="photo.name"
                sm="6" md="4" lg="3"
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
