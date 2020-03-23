<template lang="pug">
    v-app
        SystemBar
        GalleryPreview
        v-content
            Gallery
</template>

<script>
import SystemBar from '../components/SystemBar';
import Gallery from '../components/Gallery';
import GalleryPreview from '../components/GalleryPreview';

export default {
    name: 'App',
    components: { SystemBar, Gallery, GalleryPreview },
};
</script>

<style scoped>

</style>
