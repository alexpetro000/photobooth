<template lang="pug">
    v-app
        Preview
        v-navigation-drawer(
            v-model="leftDrawer"
            app
            stateless
            disable-resize-watcher
            right
        )
            | Lala
        v-content
            Gallery
            v-toolbar.app-bar(
                dense
                flat
                color="transparent"
                :value="appBar"
            )
                v-spacer
                v-btn(
                    icon
                    text
                    @click="leftDrawer = !leftDrawer"
                )
                    v-icon
                        | {{leftDrawer ? 'mdi-arrow-right' : 'mdi-image-album'}}
</template>

<script>
import Gallery from '../components/Gallery';
import Preview from '../components/Preview';

export default {
    name: 'App',

    components: { Gallery, Preview },

    data: () => ({
        appBar: true,
        leftDrawer: false,
        items: [
            'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d6df2d66-13da-4ce4-ae85-8009742c5c94/d5awbg8-62e51e50-7696-43f1-b925-6ba2366d6c92.png/v1/fill/w_900,h_687,strp/4_3_aspect_ratio_image_by_narishm_d5awbg8-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Njg3IiwicGF0aCI6IlwvZlwvZDZkZjJkNjYtMTNkYS00Y2U0LWFlODUtODAwOTc0MmM1Yzk0XC9kNWF3Ymc4LTYyZTUxZTUwLTc2OTYtNDNmMS1iOTI1LTZiYTIzNjZkNmM5Mi5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.Z9nFU5bIrsYhXJ4Y5QFvft8PtQH33v4v6-gfopH_u-8',
            'https://cdn.vuetifyjs.com/images/carousel/sky.jpg',
            'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
        ],
    }),
};
</script>

<style scoped>
    .app-bar {
        z-index: 1000 !important;
    }
</style>
