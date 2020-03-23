<template lang="pug">
    .canvas-container(ref="canvasContainer")
        canvas(ref="canvas")
        v-dialog(
            v-model="loading"
            hide-overlay
            persistent
            width="300"
        )
            v-card
                v-card-text Please stand by
                v-progress-circular.mb-0(indeterminate)
</template>

<script>
import { throttle } from 'lodash';

const { ipcRenderer: ipc } = require('electron-better-ipc');

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) {
        throw new Error('Invalid color component');
    }
    // eslint-disable-next-line no-bitwise
    return '#' + ('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
}

export default {
    name: 'EditorCanvas',
    props: ['value', 'preset', 'name'],
    data() {
        return {
            loading: true,
            scale: 1,
            processed: new Image(),
            orig: new Image(),
            bg: new Image(),
            fg: new Image(),

            moveStartX: null,
            moveStartY: null,

            throttledCanvasMove: throttle(this.canvasMove, 20),
        };
    },
    methods: {
        redraw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            switch (this.value) {
            case 'chromakey':
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.ctx.drawImage(this.processed, 0, 0,
                    this.processed.width, this.processed.height,
                    (this.bg.width - this.processed.width) / 2,
                    (this.bg.height - this.processed.height) / 2,
                    this.processed.width * this.scale,
                    this.processed.height * this.scale);
                break;
            case 'chromakey_selecting':
                if (this.orig.complete && this.orig.src) {
                    this.ctx.drawImage(this.orig, 0, 0,
                        this.orig.width, this.orig.height,
                        (this.bg.width - this.orig.width) / 2,
                        (this.bg.height - this.orig.height) / 2,
                        this.orig.width * this.scale,
                        this.orig.height * this.scale);
                }
                break;
            case 'pos':
                if (this.bg.complete) {
                    this.ctx.drawImage(this.bg, 0, 0,
                        this.bg.width * this.scale, this.bg.height * this.scale);
                }

                if (this.processed.complete && this.processed.src) {
                    const cropW = this.preset.crop.w || this.processed.width;
                    const cropH = this.preset.crop.h || this.processed.height;
                    const scaledPosX = (this.preset.pos.x || (this.bg.width - cropW) / 2)
                        * this.scale;
                    const scaledPosY = (this.preset.pos.y || (this.bg.height - cropH) / 2)
                        * this.scale;
                    const scaledPosW = (this.preset.pos.w || cropW) * this.scale;
                    const scaledPosH = (this.preset.pos.h || cropH) * this.scale;

                    this.ctx.drawImage(this.processed,
                        this.preset.crop.x || 0,
                        this.preset.crop.y || 0,
                        cropW, cropH,
                        scaledPosX, scaledPosY,
                        scaledPosW, scaledPosH);
                }

                if (this.fg.complete) {
                    this.ctx.drawImage(this.fg, 0, 0,
                        this.fg.width * this.scale, this.fg.height * this.scale);
                }
                break;
            case 'crop':
                break;
            default:
            }
        },

        resizeCanvas() {
            if (!this.bg.complete) return;

            const { canvas } = this.ctx;
            const container = this.$refs.canvasContainer;
            this.scale = Math.min(
                container.offsetWidth / this.bg.width,
                container.offsetHeight / this.bg.height,
            );
            canvas.width = this.bg.width * this.scale;
            canvas.height = this.bg.height * this.scale;

            this.ctx.rect = canvas.getBoundingClientRect();

            this.redraw();
        },
        canvasMoveStart(e) {
            e.preventDefault();
            this.ctx.canvas.addEventListener('mousemove', this.throttledCanvasMove, false);
            const x = e.clientX - this.ctx.rect.left;
            const y = e.clientY - this.ctx.rect.top;

            switch (this.value) {
            case 'pos': {
                const cropW = this.preset.crop.w || this.processed.width;
                const cropH = this.preset.crop.h || this.processed.height;
                const scaledPosX = (this.preset.pos.x || (this.bg.width - cropW) / 2)
                    * this.scale;
                const scaledPosY = (this.preset.pos.y || (this.bg.height - cropH) / 2)
                    * this.scale;
                const scaledPosW = (this.preset.pos.w || cropW) * this.scale;
                const scaledPosH = (this.preset.pos.h || cropH) * this.scale;

                if (x > scaledPosX && x < scaledPosX + scaledPosW
                    && y > scaledPosY && y < scaledPosY + scaledPosH) {
                    this.moveStartX = x - scaledPosX;
                    this.moveStartY = y - scaledPosY;
                }
                break;
            }
            case 'chromakey_selecting':
                this.preset.greenKeys.unshift({ color: '', fuzz: 0 });
                break;
            default:
            }
        },
        canvasMove(e) {
            e.preventDefault();
            const x = e.clientX - this.ctx.rect.left;
            const y = e.clientY - this.ctx.rect.top;

            switch (this.value) {
            case 'pos':
                if (this.moveStartX !== null && this.moveStartY !== null) {
                    if (!('pos' in this.preset)) this.$set(this.preset, 'pos', { x: 0, y: 0 });

                    this.$set(this.preset.pos, 'x', (x - this.moveStartX) / this.scale);
                    this.$set(this.preset.pos, 'y', (y - this.moveStartY) / this.scale);

                    this.redraw();
                }
                break;
            case 'chromakey_selecting': {
                const pixel = this.ctx.getImageData(x, y, 1, 1).data;
                this.preset.greenKeys[0].color = rgbToHex(pixel[0], pixel[1], pixel[2]);
                break;
            }
            default:
            }
        },
        canvasMoveEnd(e) {
            e.preventDefault();
            this.ctx.canvas.removeEventListener('mousemove', this.throttledCanvasMove);

            switch (this.value) {
            case 'pos':
                this.moveStartX = null;
                this.moveStartY = null;
                break;
            case 'chromakey_selecting':
                this.$emit('change', 'chromakey');
                this.reloadProcessedImage();
                break;
            default:
            }
        },

        async reloadProcessedImage() {
            this.loading = true;
            this.processed.src = await ipc.callMain('process-photo', {
                name: this.name,
                tmp: true,
                preset: this.preset,
            }).catch(console.err);
            this.processed.setAttribute('crossOrigin', '');
            console.log(this.processed.src);
        },

        checkLoading() {
            this.loading = !(this.orig.complete
                            && this.processed.complete
                            && this.bg.complete
                            && this.fg.complete);
        },
    },
    watch: {
        preset: {
            deep: true,
            handler() {
                this.redraw();
            },
        },
        value() {
            this.redraw();
        },
    },
    async mounted() {
        const { canvas } = this.$refs;
        this.ctx = canvas.getContext('2d');

        this.processed.addEventListener('load', () => {
            this.redraw();
            this.checkLoading();
        }, false);
        this.orig.addEventListener('load', () => {
            this.redraw();
            this.checkLoading();
        }, false);
        this.bg.addEventListener('load', () => {
            this.resizeCanvas();
            this.checkLoading();
        }, false);
        this.fg.addEventListener('load', () => {
            this.redraw();
            this.checkLoading();
        }, false);

        this.reloadProcessedImage();
        this.orig.src = `content://originals/${this.name}`;
        this.orig.setAttribute('crossOrigin', '');

        this.fg.src = 'content://templates/fg.png';
        this.fg.setAttribute('crossOrigin', '');

        this.bg.src = 'content://templates/bg.png';
        this.bg.setAttribute('crossOrigin', '');

        window.addEventListener('resize', this.resizeCanvas);
        canvas.addEventListener('touchstart', this.canvasMoveStart, false);
        canvas.addEventListener('touchend', this.canvasMoveEnd, false);
        canvas.addEventListener('touchmove', this.throttledCanvasMove, false);

        canvas.addEventListener('mousedown', this.canvasMoveStart, false);
        canvas.addEventListener('mouseup', this.canvasMoveEnd, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
};
</script>

<style scoped>
    .canvas-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>
