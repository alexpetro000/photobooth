<template lang="pug">
    div.pa-5.fill-height
        v-btn(height="100%" block @click="expressPhoto" :loading="busy" :disabled="busy")
            div
                v-icon(size="200px") mdi-camera
                .font-weight-black Take photo & print receipt

</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'ExpressPhoto',
    data: () => ({
        busy: false,
    }),
    methods: {
        ...mapActions('session', [
            'takePhoto',
            'commitSession',
        ]),
        async expressPhoto() {
            this.busy = true;
            this.takePhoto()
                .then(() => {
                    this.commitSession();
                    this.busy = false;
                })
                .finally(() => { this.busy = false; });
        },
    },
};
</script>

<style scoped>

</style>
