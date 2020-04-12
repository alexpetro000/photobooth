<template lang="pug">
    v-content
        SystemBar
        v-app-bar(app dense)
            v-tabs(v-model="currentTab" grow)
                v-tab Express photo
                v-tab Multi photo
        v-tabs-items.height-100(v-model="currentTab" touchless)
            v-tab-item.height-100
                ExpressPhoto
            v-tab-item.theight-100
                GalleryPreview
                Gallery
</template>

<script>
import SystemBar from '../components/SystemBar';
import Gallery from '../components/Gallery';
import GalleryPreview from '../components/GalleryPreview';
import ExpressPhoto from '../components/ExpressPhoto';

export default {
    name: 'App',
    components: {
        SystemBar, Gallery, GalleryPreview, ExpressPhoto,
    },
    data: () => ({
        currentTab: null,
    }),
};
</script>

<style scoped>
    .height-100 {
        height: 100%;
    }
</style>
