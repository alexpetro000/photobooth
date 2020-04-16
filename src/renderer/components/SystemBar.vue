<template lang="pug">
    v-system-bar(app window)
        v-spacer
        v-menu(v-model="wifiMenu" :close-on-content-click="false" :nudge-width="300" offset-y)
            template(v-slot:activator="{ on }")
                v-icon(v-on='on') {{getWifiIcon(currentWifi.quality)}}
            v-card
                v-list
                    v-list-item(v-if="currentWifi.ssid")
                        v-list-item-subtitle Current:
                        v-list-item-title {{currentWifi.ssid}}
                        v-list-item-icon
                            v-icon {{getWifiIcon(currentWifi.quality)}}
                    v-divider
                    v-list-item(v-for="net in nets" :key="net.ssid" @click="askPassword(net.ssid)")
                        v-list-item-title {{net.ssid}}
                        v-list-item-icon
                            v-icon {{getWifiIcon(net.quality)}}
        v-dialog(v-model="passwordDialog")
            v-card
                v-text-field(v-model="password" single-line autofocus)
                v-card-actions
                    v-btn(@click="connect") Connect
            SimpleKeyboard(@onChange="keyboardChange" :input="password")
    </template>

<script>
import SimpleKeyboard from './SimpleKeyboard';

const { ipcRenderer: ipc } = require('electron-better-ipc');


// const wifi = require('node-wifi');

let updateCurrentIntervalId = null;
let rescanIntervalId = null;

export default {
    name: 'SystemBar',
    components: { SimpleKeyboard },
    data: () => ({
        wifiMenu: false,
        connectCandidate: '',
        password: '',
        passwordDialog: false,
        keyboard: false,

        currentWifi: {},
        nets: [],
    }),
    methods: {
        getWifiIcon(quality) {
            if (!quality) return 'mdi-wifi-off';
            else if (quality < 25) return 'mdi-wifi-strength-1';
            else if (quality < 50) return 'mdi-wifi-strength-2';
            else if (quality < 75) return 'mdi-wifi-strength-3';
            else return 'mdi-wifi-strength-4';
        },
        connect() {
            if (!this.connectCandidate) {
                this.passwordDialog = false;
                console.log('no connect candidate!');
                return;
            }
            ipc.callMain('connect-wifi', { ssid: this.connectCandidate, password: this.password })
                .catch((err) => {
                    console.log(err);
                    this.showMsg('connection failed');
                })
                .then(() => {
                    this.showMsg('connected!');
                });
            this.passwordDialog = false;
        },

        askPassword(ssid) {
            this.password = '';
            this.connectCandidate = ssid;
            this.passwordDialog = true;
        },

        async updateCurrent() {
            [this.currentWifi] = await ipc.callMain('get-current-wifi');
            if (this.currentWifi === undefined) {
                this.currentWifi = {};
            }
        },

        async rescan() {
            this.nets = await ipc.callMain('scan-wifi');
        },

        keyboardChange(input) {
            this.password = input;
        },

        showMsg(msg) {
            this.$store.commit('setMsg', msg);
        },
    },
    watch: {
        wifiMenu(newState) {
            if (newState) {
                clearInterval(rescanIntervalId);
                rescanIntervalId = setInterval(() => {
                    this.rescan();
                }, 500);
            } else {
                clearInterval(rescanIntervalId);
                this.nets = [];
            }
        },
    },
    mounted() {
        updateCurrentIntervalId = setInterval(() => {
            this.updateCurrent();
        }, 10000);
        this.updateCurrent();
    },
    beforeDestroy() {
        clearInterval(updateCurrentIntervalId);
    },
};
</script>

<style>
    .simple-keyboard {
        /*position: fixed;*/
        /*top: 60%;*/
        /*bottom: 0;*/
        /*left: 0;*/
        /*right: 0;*/
        color: black;
        /*z-index: 1000;*/
    }
</style>
