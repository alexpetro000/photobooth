const path = require('path');
const fs = require('fs');
const svg2img = require('svg2img');
const utils = require('./utils');

const gphoto2 = utils.config.state.gphoto.simulate
    ? null
    // eslint-disable-next-line import/order
    : require('gphoto2');

class Camera {
    constructor() {
        if (gphoto2 === null) {
            return;
        }
        this.GPhoto = new gphoto2.GPhoto2();
        this.GPhoto.setLogLevel(1);
        this.GPhoto.on('log', (level, domain, message) => {
            console.log(domain, message);
        });
    }

    async init() {
        console.log('init');
        return new Promise((resolve, reject) => {
            if (gphoto2 === null) {
                resolve();
                return;
            }
            this.GPhoto.list((list) => {
                if (list.length === 0) {
                    console.log('No camera found');
                    reject(new Error('No camera found'));
                    return;
                }
                [this.camera] = list;
                if (utils.config.state.gphoto.capturetarget) {
                    this.camera.setConfigValue('capturetarget', utils.config.state.gphoto.capturetarget, (err) => {
                        if (err) {
                            console.log('setting config failed:\n' + err);
                            reject(new Error('setting config failed:\n' + err));
                            this.camera = undefined;
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    async takePhoto() {
        console.log('takePhoto');
        if (this.busy) {
            return Promise.reject(new Error('busy'));
        }
        this.busy = true;

        let promise;
        if (gphoto2 === null) {
            promise = this._createSamplePicture()
                .then((data) => this._save(data));
        } else {
            promise = this._takePictureWithCamera()
                .catch(() => this.init()
                    .then(() => this._takePictureWithCamera(), (err) => {
                        throw err;
                    }))
                .then((data) => this._save(data));
        }
        return promise.then(
            (url) => {
                this.busy = false;
                return url;
            },
            (err) => {
                this.busy = false;
                throw err;
            },
        );
    }

    async _takePictureWithCamera() {
        return new Promise((resolve, reject) => {
            if (this.camera === undefined) {
                console.log('camera not initialized');
                reject(new Error('camera not initialized'));
                return;
            }
            const keep = utils.config.state.gphoto.keep === true;
            console.log('camera.takePicture');
            this.camera.takePicture({
                download: true,
                keep,
            }, (err, data) => {
                if (err) {
                    this.camera = undefined;
                    console.log('connection to camera failed:\n' + err);
                    reject(new Error('connection to camera failed:\n' + err));
                    return;
                }
                console.log('\tOK');
                resolve(data);
            });
        });
    }

    async _createSamplePicture() {
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
                    resolve(data);
                }
            });
        });
    }

    async _save(data) {
        return new Promise((resolve, reject) => {
            const filename = 'img_' + utils.getTimestamp();
            const filePath = path.join(utils.photosDir, 'originals', filename);
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    reject(new Error('saving image failed'), err);
                }
                resolve(filename);
            });
        });
    }
}

module.exports = new Camera();
