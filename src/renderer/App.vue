<template lang="pug">
    v-app
        router-view
        v-snackbar(:value="msg" :timeout="2000") {{ msg }}

</template>

<script>
export default {
    name: 'App',
    computed: {
        msg() {
            return this.$store.state.msg;
        },
    },
    mounted() {
        this.$store.dispatch('fetchAll');
    },
};
</script>
<style>
    ::-webkit-scrollbar {
        display: none;
    }
</style>
