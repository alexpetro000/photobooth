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
                v-for="photo in session"
                :key="photo.name"
                cols="4"
            )
                v-card(height="100%")
                    v-img(:src="getUrl(photo)")
                    v-card-actions
                        v-spacer
                        v-btn(icon text @click="deletePhoto(photo)")
                            v-icon mdi-delete
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'Gallery',
    computed: {
        ...mapState('gallery', [
            'session',
        ]),
        ...mapGetters('gallery', [
            'getUrl',
        ]),
    },
    methods: {
        takePhoto() {
            this.$store.dispatch('gallery/takePhoto');
        },

        deletePhoto(photo) {
            this.$store.dispatch('gallery/deletePhoto', photo);
        },
    },
};
</script>

<style scoped>

</style>
