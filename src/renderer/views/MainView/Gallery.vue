<template lang="pug">
    v-container(fluid)
        v-row(dense)
            v-col(cols="4")
                v-card(height="100%" @click="takePhoto")
                    //v-btn(block x-large)
                    v-container(fluid)
                        v-row(justify="center")
                            v-icon(x-large) mdi-camera-plus
                    v-card-actions.pt-10(@click.stop @mousedown.stop @touchstart.stop)
                        v-spacer
                        v-btn(x-large icon text)
                            v-icon mdi-send
            v-col(
                v-for="photo in session.slice().reverse()"
                :key="photo.name"
                cols="4"
            )
                PhotoCard(:photo="photo")
</template>

<script>
import { mapState } from 'vuex';
import PhotoCard from './PhotoCard';

export default {
    name: 'Gallery',
    components: {
        PhotoCard,
    },
    computed: {
        ...mapState('gallery', [
            'session',
        ]),
    },
    methods: {
        takePhoto() {
            this.$store.dispatch('gallery/takePhoto');
        },
    },
};
</script>

<style scoped>

</style>
