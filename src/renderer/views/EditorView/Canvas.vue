<template lang="pug">
    .canvas-container(ref="canvasContainer")
        canvas(ref="canvas")
</template>

<script>
import { throttle, cloneDeep } from 'lodash';

export default {
    name: 'Canvas',
    props: ['value', 'preset', 'url'],
    data() {
        return {
            scale: 1,
            img: new Image(),
            bg: new Image(),
            fg: new Image(),

            moveStartX: null,
            moveStartY: null,

            throttledCanvasMove: throttle(this.canvasMove, 20),
            imgW: 0,
            imgH: 0,
        };
    },
    computed: {
        fullPreset() {
            const preset = cloneDeep(this.preset);
            if (!('keys' in preset)) preset.keys = [];
            if (!('crop' in preset)) preset.crop = {};
            if (!('pos' in preset)) preset.pos = {};
            if (!('erode' in preset)) preset.erode = 0;
            if (!('blur' in preset)) preset.blur = 0;

            if (!('x' in preset.crop)) preset.crop.x = 0;
            if (!('y' in preset.crop)) preset.crop.y = 0;

            if (!('w' in preset.crop)) preset.crop.w = this.imgW;
            if (!('h' in preset.crop)) preset.crop.h = this.imgH;

            if (!('w' in preset.pos)) preset.pos.w = preset.crop.w;
            if (!('h' in preset.pos)) preset.pos.h = preset.crop.h;
            if (!('x' in preset.pos)) preset.pos.x = (this.bg.width - preset.crop.w) / 2;
            if (!('y' in preset.pos)) preset.pos.y = (this.bg.height - preset.crop.h) / 2;

            return preset;
        },
        scaledPresetPos() {
            return Object.keys(this.fullPreset.pos).reduce((result, key) => {
                result[key] = this.fullPreset.pos[key] * this.scale;
                return result;
            }, {});
        },
    },
    methods: {
        redraw() {
            const { crop, pos } = this.fullPreset;

            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.drawImage(this.bg, 0, 0,
                this.bg.width * this.scale, this.bg.height * this.scale);

            this.ctx.drawImage(this.img, crop.x, crop.y,
                crop.w, crop.h,
                pos.x * this.scale, pos.y * this.scale,
                pos.w * this.scale, pos.h * this.scale);

            this.ctx.drawImage(this.fg, 0, 0,
                this.fg.width * this.scale, this.fg.height * this.scale);
        },

        resizeCanvas() {
            if (!this.img.complete || !this.fg.complete || !this.bg.complete) return;

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

            if (x > this.scaledPresetPos.x && x < this.scaledPresetPos.x + this.scaledPresetPos.w
             && y > this.scaledPresetPos.y && y < this.scaledPresetPos.y + this.scaledPresetPos.h) {
                this.moveStartX = x - this.scaledPresetPos.x;
                this.moveStartY = y - this.scaledPresetPos.y;
            }
        },
        canvasMove(e) {
            e.preventDefault();
            if (this.moveStartX !== null && this.moveStartY !== null) {
                const x = e.clientX - this.ctx.rect.left;
                const y = e.clientY - this.ctx.rect.top;

                if (!('pos' in this.preset)) this.$set(this.preset, 'pos', { x, y });

                this.preset.pos.x = (x - this.moveStartX) / this.scale;
                this.preset.pos.y = (y - this.moveStartY) / this.scale;

                this.redraw();
            }

            // console.log('move', , );
        },
        canvasMoveEnd(e) {
            e.preventDefault();
            this.ctx.canvas.removeEventListener('mousemove', this.canvasMove);

            this.moveStartX = null;
            this.moveStartY = null;
        },

        updateImgSize() {
            this.imgW = this.img.width;
            this.imgH = this.img.height;
        },
    },
    watch: {
        preset: {
            deep: true,
            handler() {
                this.redraw();
            },
        },
        url(newUrl) {
            this.img.src = newUrl;
        },
    },
    mounted() {
        const { canvas } = this.$refs;
        this.ctx = canvas.getContext('2d');

        this.img.addEventListener('load', this.resizeCanvas, false);
        this.img.addEventListener('load', this.updateImgSize, false);
        this.fg.addEventListener('load', this.resizeCanvas, false);
        this.bg.addEventListener('load', this.resizeCanvas, false);

        this.img.src = this.url;
        this.fg.src = 'content://templates/fg.png';
        this.bg.src = 'content://templates/bg.png';

        window.addEventListener('resize', this.resizeCanvas);
        canvas.addEventListener('touchstart', this.canvasMoveStart, false);
        canvas.addEventListener('touchend', this.canvasMoveEnd, false);
        canvas.addEventListener('touchmove', this.throttledCanvasMove, false);

        canvas.addEventListener('mousedown', this.canvasMoveStart, false);
        canvas.addEventListener('mouseup', this.canvasMoveEnd, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);

        this.img.removeEventListener('load', this.resizeCanvas);
        this.img.removeEventListener('load', this.updateImgSize);
        this.fg.removeEventListener('load', this.resizeCanvas);
        this.bg.removeEventListener('load', this.resizeCanvas);

        const { canvas } = this.ctx;
        canvas.removeEventListener('touchstart', this.canvasMoveStart);
        canvas.removeEventListener('touchend', this.canvasMoveEnd);
        canvas.removeEventListener('touchmove', this.throttledCanvasMove);
        canvas.removeEventListener('mousedown', this.canvasMoveStart);
        canvas.removeEventListener('mouseup', this.canvasMoveEnd);
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
