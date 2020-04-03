<template lang="pug">
    v-content
        EditorLoadingDialog
        EditorAppBar
        EditorTools(v-if="preset")
        EditorCanvas(v-if="preset")
</template>

<script>
import { mapState } from 'vuex';
import EditorCanvas from '../components/EditorCanvas';
import EditorAppBar from '../components/EditorAppBar';
import EditorLoadingDialog from '../components/EditorLoadingDialog';
import EditorTools from '../components/EditorTools';

export default {
    name: 'EditorView',
    components: {
        EditorTools,
        EditorLoadingDialog,
        EditorAppBar,
        EditorCanvas,
    },
    computed: {
        name() {
            return this.$route.params.name;
        },
        photo() {
            return this.$store.getters['session/getPhoto'](this.name);
        },
        ...mapState('editor', [
            'preset',
        ]),
    },
    created() {
        this.$store.dispatch('editor/init', this.name);
        console.log(this.name);
    },
    watch: {
        photo() {
            if (!this.preset) this.$store.dispatch('editor/init', this.name);
        },
    },
};
</script>

<style scoped>
    .root{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>
