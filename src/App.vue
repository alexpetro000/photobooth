<template lang="pug">
    router-view
</template>

<script>

export default {
    name: 'App',

    components: {
    },

    data: () => ({
        appBar: true,
        carousel: 1,
        carouselTouchHandler: {
            left: 'swipeL',
            // right: swipeR,
            up: () => this.swipe('Up'),
            down: () => this.swipe('Down'),
        },

        leftDrawer: false,
        wifi_selected: '',
        wifi_list: [],
        wifi_loading: true,
        items: [
            {
                src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg',
            },
            {
                src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg',
            },
            {
                src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
            },
            {
                src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
            },
        ],
    }),
    methods: {
        swipeL() {
            this.carousel++;
        },
        swipeR() {
            this.carousel--;
        },
        swipe(direction) {
            console.log(direction);
        },
    },
};
</script>
