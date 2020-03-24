<template lang="pug">
    v-dialog(
        :value="loadingDialog"
        hide-overlay
        persistent
        width="300"
    )
        v-card
            v-card-text Image processing...
            v-progress-linear.mb-0(indeterminate)
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'EditorLoadingDialog',
    computed: {
        ...mapState('editor', [
            'loadingDialog',
        ]),
    },
};
</script>

<style scoped>

</style>
