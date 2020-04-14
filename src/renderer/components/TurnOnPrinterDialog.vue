<template lang="pug">
    v-dialog(v-model="turnOnPrinterDialog" persistent width="300px")
        v-card
            v-card-title Turn on the receipt printer!
            v-card-text Make sure that the receipt printer is on
            v-card-actions
                v-spacer
                v-btn(color="green" @click="turnOnPrinterDialog = false") OK
</template>

<script>
export default {
    name: 'TurnOnPrinterDialog',
    computed: {
        turnOnPrinterDialog: {
            get() {
                return this.$store.state.turnOnPrinterDialog;
            },
            set(v) {
                this.$store.commit('setTurnOnPrinterDialog', v);
            },
        },

    },
};
</script>

<style scoped>

</style>
