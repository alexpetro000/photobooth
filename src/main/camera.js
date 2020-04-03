const path = require('path');
const { exec } = require('child_process');

const utils = require('./utils');

let initialized = false;

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

        exec(`gphoto2 --no-keep --force-overwrite --filename ${filePath} --capture-image-and-download`, (err, stdout, stderr) => {
            if (err) {
                this.initialized = false;
                reject(new Error(stderr));
            } else {
                resolve(filename);
            }
        });
    }));
}

module.exports = {
    takePhoto,
};
