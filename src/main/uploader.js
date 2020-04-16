const fetch = require('electron-fetch').default;
const FormData = require('form-data');
const path = require('path');
const url = require('url');
const fs = require('fs');

const editor = require('./editor');
const utils = require('./utils');

function uploadAuth(token, length) {
    const authPath = url.resolve(utils.config.state.web.uploadUrl, 'upload/start');
    return fetch(authPath,
        {
            method: 'POST',
            body: JSON.stringify({
                name: utils.config.state.web.name,
                secret: utils.config.state.web.secret,
                token,
                count: length,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.json())
        .then((json) => json.access_token);
}

async function uploadById(uploadToken, id, filePath) {
    const formData = new FormData();
    formData.append(
        'photo',
        fs.createReadStream(filePath),
        filePath.replace(/^.*\//, ''),
    );

    return fetch(url.resolve(utils.config.state.web.uploadUrl, 'upload/' + id), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + uploadToken },
        body: formData,
    });
}

async function uploadPhoto(photo, uploadToken) {
    function processPhoto(processAttempt = 0) {
        if (processAttempt > 3) return false;
        return editor.processPhoto(photo).catch(() => processPhoto(processAttempt + 1));
    }

    const processedPhoto = await processPhoto();
    if (!processedPhoto) return true;

    const filePath = path.join(utils.photosDir, processedPhoto);
    console.log(photo, filePath);
    const res = await uploadById(uploadToken, photo.index + 1, filePath);
    if (res.ok || res.statusCode === 406) { // 406 - Already uploaded
        return true;
    } else {
        throw res.statusCode;
    }
}

async function uploadSession(session, attempt = 0) {
    if (attempt > 2) throw new Error('Max upload attempts exceeded');

    if (!session.uploadToken) {
        session.uploadToken = await uploadAuth(session.token, session.length);
    }

    return new Promise((resolve, reject) => {
        const run = () => {
            if (!session.photos.length) {
                console.log('session uploaded!');
                resolve();
                return;
            }
            const photo = session.photos[0];
            console.log(photo);
            uploadPhoto(photo, session.uploadToken)
                .then(() => {
                    console.log('photo uploaded', photo);
                    utils.deleteFiles(photo.name);
                    session.photos.shift();
                    run();
                }, (err) => {
                    console.log('rejected', err);
                    reject(err);
                });
        };
        run();
    });
}

let uploading = false;

function startUpload() {
    if (uploading) return;
    uploading = true;

    const run = () => {
        if (!utils.upload.state.length) {
            uploading = false;
            return;
        }
        const session = utils.upload.state[0];
        uploadSession(session)
            .then(() => {
                utils.upload.state.shift();
                run();
            }, (e) => {
                console.log(e);
                setTimeout(run, utils.config.state.uploadRetryInterval);
            });
    };
    run();
}

function commitSession(token, photos) {
    if (utils.config.state.uploadOriginals) {
        for (let i = photos.length - 1; i >= 0; i--) { // upload originals too
            if (photos[i].preset !== null) {
                photos.splice(i + 1, 0, {
                    ...photos[i],
                    preset: null,
                });
            }
        }
    }

    console.log('PHOTOS:', photos);

    photos.forEach((photo, i) => {
        photo.index = i;
    });

    utils.upload.state.push({
        token,
        length: photos.length,
        photos,
    });
    startUpload();
}

module.exports = {
    commitSession,
    startUpload,
};
