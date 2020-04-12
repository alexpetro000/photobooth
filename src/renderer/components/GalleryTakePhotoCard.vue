<template lang="pug">
    v-card.d-flex.flex-column.justify-space-between.pa-2(
        @click="newPhoto"
        color="red"
        :loading="busy" :disabled="busy"
        height="100%"
        min-height="200px"
    )
        .flex-grow-1.d-flex.flex-column.justify-center.align-center
            v-icon(x-large) mdi-camera-plus
            .font-weight-black TAKE PHOTO
        .flex-row(@click.stop @mousedown.stop @touchstart.stop)
            v-btn(x-large block @click="commitSession") Print the receipt
                v-icon.ml-3 mdi-printer
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'GalleryTakePhotoCard',
    data: () => ({
        busy: false,
    }),
    methods: {
        ...mapActions('session', [
            'takePhoto',
            'processPhoto',
            'commitSession',
        ]),
        newPhoto() {
            this.busy = true;
            this.takePhoto()
                .then((photo) => { this.processPhoto(photo); })
                .finally(() => { this.busy = false; });
        },
    },
};
</script>

<style scoped>
    .card {

    }
</style>
