<template lang="pug">
    v-app
        v-navigation-drawer(
            v-model="leftDrawer"
            app
            stateless
            disable-resize-watcher
            right
        )
            | Lala
        v-content
            v-container(fluid)
                v-row(dense)
                    v-col(cols="4")
                        v-card(height="100%" @click="takeShot")
                            //v-btn(block x-large)
                            v-container(fluid)
                                v-row(justify="center")
                                    v-icon(x-large) mdi-camera-plus
                            v-card-actions.pt-10(@click.stop @mousedown.stop @touchstart.stop)
                                v-spacer
                                v-btn(x-large icon text)
                                    v-icon mdi-send
                    v-col(
                        v-for="(item, i) in items"
                        :key="i"
                        cols="4"
                    )
                        v-img(aspect-ratio="1" :src="item")
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

// const fs = require('fs');
// const gphoto2 = require('gphoto2');
//
// const GPhoto = new gphoto2.GPhoto2();

export default {
    name: 'App',

    components: {
    },

    data: () => ({
        appBar: true,
        leftDrawer: false,
        items: [
            'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d6df2d66-13da-4ce4-ae85-8009742c5c94/d5awbg8-62e51e50-7696-43f1-b925-6ba2366d6c92.png/v1/fill/w_900,h_687,strp/4_3_aspect_ratio_image_by_narishm_d5awbg8-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Njg3IiwicGF0aCI6IlwvZlwvZDZkZjJkNjYtMTNkYS00Y2U0LWFlODUtODAwOTc0MmM1Yzk0XC9kNWF3Ymc4LTYyZTUxZTUwLTc2OTYtNDNmMS1iOTI1LTZiYTIzNjZkNmM5Mi5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.Z9nFU5bIrsYhXJ4Y5QFvft8PtQH33v4v6-gfopH_u-8',
            'https://cdn.vuetifyjs.com/images/carousel/sky.jpg',
            'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
        ],
    }),
    methods: {
        takeShot() {
            console.log('shot');
        },
    },
    mounted() {
        setTimeout(() => {
            this.items.push(
                'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
            );
        }, 2500);
    },
};
</script>

<style scoped>
    .app-bar {
        z-index: 1000 !important;
    }
</style>
