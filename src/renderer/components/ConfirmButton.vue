<template lang="pug">
    v-dialog(
        v-model="dialog"
        :max-width="width"
    )
        template(v-slot:activator="{ on }")
            v-btn(icon text v-on="on")
                v-icon {{icon}}
        v-card
            v-card-title.headline {{question}}
            v-card-actions
                v-btn(
                    text
                    @click="dialog = false; $emit('canceled');"
                ) {{cancel}}
                v-spacer
                v-btn(
                    text
                    @click="dialog = false; $emit('confirmed');"
                ) {{confirm}}
</template>

<script>
export default {
    name: 'ConfirmButton',
    props: {
        question: { required: true },
        icon: { required: true },
        confirm: { default: 'Yes' },
        cancel: { default: 'No' },
        width: { default: 300 },
    },
    data: () => ({
        dialog: false,
    }),
};
</script>
