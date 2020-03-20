const path = require('path');
const fs = require('fs');
const svg2img = require('svg2img');
const { exec } = require('child_process');

const utils = require('./utils');

class Camera {
    constructor() {
        this.initialized = false;
        this.simulate = utils.config.state.gphoto.simulate;
    }

    init() {
        return new Promise((resolve, reject) => {
            if (this.initialized) {
                resolve();
                return;
            }
            exec('gphoto2 --set-config capturetarget=0', (err, stdout, stderr) => {
                if (err) {
                    this.initialized = false;
                    console.error('init failed');
                    reject(new Error(stderr));
                } else {
                    this.initialized = true;
                    console.log('init ok');
                    resolve();
                }
            });
        });
    }

    takePhoto() {
        console.log('takePhoto');
        return this.simulate
            ? this._createSamplePicture()
            : this.init().then(() => this._takePictureWithCamera());
    }

    _takePictureWithCamera() {
        return new Promise((resolve, reject) => {
            const filename = 'img_' + utils.getTimestamp();
            const filePath = path.join(utils.photosDir, 'originals', filename);

            exec(`gphoto2 --no-keep --force-overwrite --filename ${filePath} --capture-image-and-download`, (err, stdout, stderr) => {
                if (err) {
                    this.initialized = false;
                    reject(new Error(stderr));
                } else {
                    resolve(filename);
                }
            });
        });
    }

    _createSamplePicture() {
        return new Promise((resolve, reject) => {
            console.log('sample picture');

            const timestamp = utils.getTimestamp();
            const watermark = `<svg width="2256" height="1504">
<rect x="0" y="0" width="2256" height="1504" stroke="transparent" stroke-width="0" fill="#f00" fill-opacity="0.5" />
<text font-size="100" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#000">${timestamp}</text>
</svg>`;
            svg2img(watermark, (err, data) => {
                if (err) {
                    reject(new Error('failed to create sample picture' + err));
                } else {
                    const filename = 'img_' + utils.getTimestamp();
                    const filePath = path.join(utils.photosDir, 'originals', filename);

                    fs.writeFile(filePath, data, (saveError) => {
                        if (saveError) {
                            reject(new Error('saving image failed'), err);
                        }
                        resolve(filename);
                    });
                }
            });
        });
    }
}

module.exports = new Camera();
