<template lang="pug">
    .canvas-container(ref="canvasContainer")
        canvas(ref="canvas")
</template>

<script>
import { throttle } from 'lodash';
import { mapState, mapMutations, mapActions } from 'vuex';

const { rgbToHex } = require('../lib/helpers');

export default {
    name: 'EditorCanvas',
    data() {
        return {
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
    computed: {
        ...mapState('editor', [
            'mode',
            'preset',
            'name',
            'processedUrl',
        ]),
    },
    methods: {
        ...mapMutations('editor', [
            'addPresetChromakeyPoint',
            'setPresetChromakeyPointColor',
            'setMode',
            'setLoadingDialog',
            'setPresetPos',
            'assignPresetPos',
            'setPresetCrop',
            'assignPresetCrop',
        ]),

        ...mapActions('editor', [
            'resetPos',
            'reloadProcessed',
            'deleteChromakeyPoint',
        ]),

        redraw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            switch (this.mode) {
            case 'chromakey':
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
                    const scaledPosW = cropW * this.scale * (this.preset.pos.scale || 1);
                    const scaledPosH = cropH * this.scale * (this.preset.pos.scale || 1);

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
                if (this.orig.complete && this.orig.src) {
                    this.ctx.drawImage(this.orig, 0, 0,
                        this.orig.width, this.orig.height,
                        (this.bg.width - this.orig.width) / 2,
                        (this.bg.height - this.orig.height) / 2,
                        this.orig.width * this.scale,
                        this.orig.height * this.scale);
                }
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(
                    this.preset.crop.x * this.scale || 0,
                    this.preset.crop.y * this.scale || 0,
                    (this.preset.crop.w || this.orig.width) * this.scale,
                    (this.preset.crop.h || this.orig.height) * this.scale,
                );
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
        canvasMouseDown(e) {
            e.preventDefault();
            window.addEventListener('mousemove', this.canvasMouseMove, false);
            this.handleMoveStart(
                e.clientX - this.ctx.rect.left,
                e.clientY - this.ctx.rect.top,
            );
        },
        canvasTouchStart(e) {
            e.preventDefault();
            window.addEventListener('touchmove', this.canvasTouchMove, { passive: false });
            this.handleMoveStart(
                e.changedTouches[0].clientX - this.ctx.rect.left,
                e.changedTouches[0].clientY - this.ctx.rect.top,
            );
        },
        handleMoveStart(x, y) {
            switch (this.mode) {
            case 'pos': {
                const cropW = this.preset.crop.w || this.processed.width;
                const cropH = this.preset.crop.h || this.processed.height;
                const scaledPosX = (this.preset.pos.x || (this.bg.width - cropW) / 2)
                    * this.scale;
                const scaledPosY = (this.preset.pos.y || (this.bg.height - cropH) / 2)
                    * this.scale;
                const scaledPosW = cropW * this.scale * (this.preset.pos.scale || 1);
                const scaledPosH = cropH * this.scale * (this.preset.pos.scale || 1);
                // const scaledPosW = cropW * this.scale;
                // const scaledPosH = cropH * this.scale;

                if (x > scaledPosX && x < scaledPosX + scaledPosW
                    && y > scaledPosY && y < scaledPosY + scaledPosH) {
                    this.moveStartX = x - scaledPosX;
                    this.moveStartY = y - scaledPosY;
                }
                break;
            }
            case 'chromakey_selecting': {
                this.addPresetChromakeyPoint();
                const pixel = this.ctx.getImageData(x, y, 1, 1).data;
                this.setPresetChromakeyPointColor([0, rgbToHex(pixel[0], pixel[1], pixel[2])]);
                break;
            }
            case 'crop':
                this.moveStartX = x;
                this.moveStartY = y;
                break;
            default:
            }
        },

        canvasMouseMove(e) {
            e.preventDefault();
            this.throttledCanvasMove(
                e.clientX - this.ctx.rect.left,
                e.clientY - this.ctx.rect.top,
            );
        },
        canvasTouchMove(e) {
            e.preventDefault();
            this.throttledCanvasMove(
                e.changedTouches[0].clientX - this.ctx.rect.left,
                e.changedTouches[0].clientY - this.ctx.rect.top,
            );
        },
        canvasMove(x, y) {
            if (x > this.ctx.canvas.width) x = this.ctx.canvas.width;
            if (y > this.ctx.canvas.height) y = this.ctx.canvas.height;
            if (x < 0) x = 0;
            if (y < 0) y = 0;

            switch (this.mode) {
            case 'pos':
                if (this.moveStartX !== null && this.moveStartY !== null) {
                    this.assignPresetPos({
                        x: (x - this.moveStartX) / this.scale,
                        y: (y - this.moveStartY) / this.scale,
                    });
                    this.redraw();
                }
                break;
            case 'chromakey_selecting': {
                const pixel = this.ctx.getImageData(x, y, 1, 1).data;
                this.setPresetChromakeyPointColor([0, rgbToHex(pixel[0], pixel[1], pixel[2])]);
                break;
            }
            case 'crop':
                this.setPresetCrop({
                    x: this.moveStartX / this.scale,
                    y: this.moveStartY / this.scale,
                    w: (x - this.moveStartX) / this.scale,
                    h: (y - this.moveStartY) / this.scale,
                });
                this.redraw();
                break;
            default:
                break;
            }
        },
        canvasMoveEnd() {
            // e.preventDefault();
            // this.ctx.canvas.removeEventListener('mousemove', this.throttledCanvasMove);
            window.removeEventListener('mousemove', this.canvasMouseMove);
            window.removeEventListener('touchmove', this.canvasTouchMove);

            switch (this.mode) {
            case 'pos':
                this.moveStartX = null;
                this.moveStartY = null;
                break;
            case 'chromakey_selecting':
                this.$emit('change', 'chromakey');
                this.setMode('chromakey');
                this.reloadProcessed();
                break;
            case 'crop':
                this.moveStartX = null;
                this.moveStartY = null;
                break;
            default:
            }
        },


        checkLoading() {
            const loading = !(this.orig.complete
                            && this.processed.complete
                            && this.processed.src
                            && this.bg.complete
                            && this.fg.complete);
            this.setLoadingDialog(loading);
        },
    },
    watch: {
        preset: {
            deep: true,
            handler() {
                this.redraw();
            },
        },
        mode() {
            this.redraw();
        },
        processedUrl(newVal) {
            this.processed.src = newVal;
            this.processed.setAttribute('crossOrigin', '');
        },
    },
    mounted() {
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

        // this.reloadProcessed();
        // this.processed.src = this.processedUrl;
        this.orig.src = `content://originals/${this.name}`;
        this.fg.src = 'content://templates/fg.png';
        this.bg.src = 'content://templates/bg.jpg';

        this.orig.setAttribute('crossOrigin', '');
        this.bg.setAttribute('crossOrigin', '');
        this.fg.setAttribute('crossOrigin', '');

        window.addEventListener('resize', this.resizeCanvas);
        canvas.addEventListener('touchstart', this.canvasTouchStart, { passive: false });
        canvas.addEventListener('mousedown', this.canvasMouseDown, false);

        window.addEventListener('touchend', this.canvasMoveEnd, { passive: false });
        window.addEventListener('mouseup', this.canvasMoveEnd, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
        window.removeEventListener('touchend', this.canvasMoveEnd);
        window.removeEventListener('mouseup', this.canvasMoveEnd);
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
    canvas {
        background-image: url(../assets/checkerboard.jpg);
        background-color: transparent;
    }
</style>
