const fetch = require('electron-fetch').default;
const FormData = require('form-data');
const path = require('path');
const url = require('url');
const fs = require('fs');

const editor = require('./editor');
const utils = require('./utils');

function uploadAuth(session) {
    const authPath = url.resolve(utils.config.state.web.uploadUrl, 'upload/start');
    return fetch(authPath,
        {
            method: 'POST',
            body: JSON.stringify({
                name: utils.config.state.web.name,
                secret: utils.config.state.web.secret,
                token: session.token,
                count: session.photos.length,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.json())
        .then((json) => {
            session.accessToken = json.access_token;
            return session.accessToken;
        });
}

/* async function uploadAll(accessToken, photos) {
    const formData = new FormData();
    photos.forEach((photo) => {
        formData.append(
            'photos',
            fs.createReadStream(path.join(utils.photosDir, editor.processPhoto(photo))),
            photo.name,
        );
    });

    return fetch(url.resolve(utils.config.state.web.uploadUrl, 'upload/all'), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + accessToken },
        body: formData,
        redirect: 'follow',
    });
} */

async function uploadById(accessToken, id, filePath) {
    const formData = new FormData();
    formData.append(
        'photo',
        fs.createReadStream(filePath),
        filePath.replace(/^.*\//, ''),
    );

    return fetch(url.resolve(utils.config.state.web.uploadUrl, 'upload/' + id), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + accessToken },
        body: formData,
    });
}

async function uploadSession(session, attempt = 0) {
    if (attempt > 2) throw new Error('Max upload attempts exceeded');
    if (!session.accessToken) await uploadAuth(session);
    return session.photos.reduce(async (prevPromise, photo) => {
        const index = await prevPromise;
        if (photo.uploaded) return index + 1;
        const filePath = path.join(utils.photosDir, await editor.processPhoto(photo));
        console.log(photo, filePath);
        const res = await uploadById(session.accessToken, index, filePath);
        if (res.ok || res.statusCode === 406) { // 406 - Already uploaded
            photo.uploaded = true;
            return index + 1;
        } else {
            throw res.statusCode;
        }
    }, Promise.resolve(1))
        .catch((status) => {
            if (status === 401) { // 401 - Unauthorized
                session.accessToken = false;
            } else {
                console.error(status);
            }
            return uploadSession(session, attempt + 1);
        });
}

let uploading = false;

async function startUpload() {
    if (uploading) return;
    uploading = true;
    for (let i = 0; i < utils.upload.state.length; i++) {
        const session = utils.upload.state[i];
        try {
            // eslint-disable-next-line no-await-in-loop
            await uploadSession(session);
            session.photos.forEach((photo) => utils.deleteFiles(photo.name));
            utils.upload.state.splice(i, 1);
            i--;
        } catch (e) {
            console.error(e, session);
            break;
        }
    }

    uploading = false;
    if (utils.upload.state.length) {
        setTimeout(startUpload, utils.config.state.uploadRetryInterval);
    }
}

function commitSession(token, photos) {
    if (utils.config.state.uploadOriginal) {
        for (let i = photos.length - 1; i >= 0; i--) { // upload originals too
            if (photos[i].preset !== null) {
                photos.splice(i + 1, 0, {
                    ...photos[i],
                    preset: null,
                });
            }
        }
    }
    utils.upload.state.push({
        token,
        photos,
    });
    startUpload().catch(console.error);
}

module.exports = {
    commitSession,
    startUpload,
};
