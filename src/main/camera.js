const path = require('path');
const { exec } = require('child_process');
const gpio = require('gpio');

const utils = require('./utils');

let initialized = false;

const flashPin = gpio.export(utils.config.state.flashPin, {
    direction: gpio.DIRECTION.OUT,
});

function init() {
    return new Promise((resolve, reject) => {
        if (initialized) {
            resolve();
            return;
        }
        exec('gphoto2 --set-config capturetarget=0', (err, stdout, stderr) => {
            if (err) {
                initialized = false;
                console.error('init failed');
                reject(new Error(stderr));
            } else {
                initialized = true;
                console.log('init ok');
                resolve();
            }
        });
    });
}

function takePhoto() {
    return init().then(() => new Promise((resolve, reject) => {
        const filename = 'img_' + utils.getTimestamp();
        const filePath = path.join(utils.photosDir, 'originals', filename);
        flashPin.set();
        exec(`gphoto2 --no-keep --force-overwrite --filename ${filePath} --capture-image-and-download`, (err, stdout, stderr) => {
            if (err) {
                this.initialized = false;
                reject(new Error(stderr));
            } else {
                resolve(filename);
            }
        });
        flashPin.reset();
    }));
}

module.exports = {
    takePhoto,
};
