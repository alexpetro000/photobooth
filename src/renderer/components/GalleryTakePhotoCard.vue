<template lang="pug">
    v-card(height="100%" @click="takePhoto")
        //v-btn(block x-large)
        v-container(fluid)
            v-row(justify="center")
                v-icon(x-large) mdi-camera-plus
        v-card-actions.pt-10(@click.stop @mousedown.stop @touchstart.stop)
            v-spacer
            v-btn(
                x-large
                icon
                text
                @click="commitSession"
            )
                v-icon mdi-send
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'GalleryTakePhotoCard',
    methods: {
        ...mapActions('session', [
            'takePhoto',
            'commitSession',
        ]),
    },
};
</script>

<style scoped>

</style>
