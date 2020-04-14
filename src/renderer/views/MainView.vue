<template lang="pug">
    v-content
        SystemBar
        GalleryPreview
        v-app-bar(app dense)
            v-tabs(v-model="currentTab" grow)
                v-tab Express photo
                v-tab Multi photo
        v-tabs-items.height-100(v-model="currentTab" touchless)
            v-tab-item.height-100
                ExpressPhoto
            v-tab-item.theight-100
                Gallery
        v-dialog(
            v-model="shutdownDialog"
            max-width="300"
        )
            template(v-slot:activator="{ on }")
                v-btn.shutdown-btn(icon x-large color="red" v-on="on")
                    v-icon mdi-power
            v-card
                v-card-title.headline Shutdown?
                v-card-actions
                    v-btn(
                        text
                        @click="shutdownDialog = false"
                    ) Cancel
                    v-spacer
                    v-btn(
                        text
                        @click="shutdown"
                    ) Yes
        TurnOnPrinterDialog
</template>

<script>
import SystemBar from '../components/SystemBar';
import Gallery from '../components/Gallery';
import GalleryPreview from '../components/GalleryPreview';
import ExpressPhoto from '../components/ExpressPhoto';
import TurnOnPrinterDialog from '../components/TurnOnPrinterDialog';

const { ipcRenderer: ipc } = require('electron-better-ipc');

export default {
    name: 'App',
    components: {
        TurnOnPrinterDialog,
        SystemBar,
        Gallery,
        GalleryPreview,
        ExpressPhoto,
    },
    data: () => ({
        currentTab: null,
        shutdownDialog: false,
    }),
    methods: {
        shutdown() {
            ipc.callMain('shutdown');
        },
    },
};
</script>

<style scoped>
    .height-100 {
        height: 100%;
    }
    .shutdown-btn {
        position: absolute;
        bottom: 0;
        right: 0;
    }
</style>
