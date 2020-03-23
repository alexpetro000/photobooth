<template lang="pug">
    v-card()
        v-card-title
            |Keys:
            v-spacer
            v-btn(icon text)
                v-icon mdi-plus-circle-outline
        v-card.ma-2(v-for="(key, i) in value")
            v-btn.close-btn(icon text @click="deleteKey(i)")
                v-icon mdi-close
            v-card-text
                v-icon.mr-3(:style="`color: ${key.color}`") mdi-square
                |{{ key.color }}
            v-slider.mx-3(v-model="key.fuzz", max="40" thumb-label height="1em")
</template>

<script>
export default {
    name: 'Keys',
    props: ['value'],
    methods: {
        deleteKey(i) {
            console.log(i);
            this.value.splice(i, 1);
            this.$emit('input', this.value);
        },
    },
};
</script>

<style scoped>
    .close-btn {
        position: absolute;
        right: 5px;
        top: 5px;
    }
</style>
