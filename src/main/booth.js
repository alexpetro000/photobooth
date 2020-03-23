const { app, protocol } = require('electron');
const { ipcMain: ipc } = require('electron-better-ipc');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const uuidV4 = require('uuid').v4;
const { isEqual } = require('lodash');
const wifi = require('node-wifi');

const utils = require('./utils');
const camera = require('./camera');
const editor = require('./editor');

const protocolName = 'content';

wifi.init({
    iface: utils.config.state.iface,
});

app.on('ready', () => {
    protocol.registerFileProtocol(protocolName, (request, callback) => {
        const url = request.url.substr(protocolName.length + 3).split('?')[0];
        callback({ path: path.join(utils.photosDir, url) });
    }, (error) => {
        if (error) console.error('Failed to register protocol');
    });
});

ipc.answerRenderer('fetch-photo', async (options) => {
    console.log('fetch-photo', JSON.stringify(options));

    if (!options.name) return false;
    // let base64;

    if (options.preset !== null) {
        let preset;
        if (options.preset) {
            preset = typeof options.preset === 'string'
                ? utils.preset.state[options.preset]
                : options.preset;
        } else {
            preset = utils.preset.state.default;
        }
        const edited = path.join(utils.photosDir, 'edited', options.name);

        const existingPreset = await fsPromises.access(edited + '.png')
            .then(() => fsPromises.readFile(edited + '.json'))
            .then((buf) => JSON.parse(buf.toString()))
            .catch(() => null);

        if (!isEqual(preset, existingPreset)) {
            const input = path.join(utils.photosDir, 'originals', options.name);
            await editor.proceed(input, preset, edited + '.png');
            fs.writeFileSync(edited + '.json', JSON.stringify(preset));
        }
        return protocolName + '://edited/' + options.name + '.png';
        // base64 = await image2base64(file);
        // fs.unlink(file, (err) => { if (err) console.error(err); });
    } else {
        return protocolName + '://originals/' + options.name;
    }
});

ipc.answerRenderer('fetch-config', () => {
    console.log('fetch-config');

    return utils.config.clone();
});

ipc.answerRenderer('fetch-session', () => {
    console.log('session-fetch');
    return utils.session.clone();
});

ipc.answerRenderer('take-photo', async () => {
    console.log('take-photo');

    const filename = await camera.takePhoto();
    const photo = { name: filename };
    utils.session.state.push(photo);
    return photo;
});

ipc.answerRenderer('commit-session', () => {
    console.log('commit-session');

    const obj = {
        uuid: uuidV4(),
        photos: utils.session.clone(),
    };
    utils.upload.state.push(obj);
    utils.session.clear();
    // TODO: uploader
    // TODO: printer
});

ipc.answerRenderer('delete-photo', (photo) => {
    console.log('delete-photo');
    function logError(e) {
        if (e) console.error(e);
    }
    fs.unlink(path.join(utils.photosDir, 'originals', photo.name), logError);
    fs.unlink(path.join(utils.photosDir, 'edited', photo.name + '.png'), logError);
    fs.unlink(path.join(utils.photosDir, 'edited', photo.name + '.json'), logError);
    utils.session.state = utils.session.state.filter((item) => item.name !== photo.name);
});

ipc.answerRenderer('save-preset', ({ name, preset }) => {
    utils.preset.state[name] = preset;
});

ipc.answerRenderer('fetch-preset', (name) => utils.preset.state[name]);

ipc.answerRenderer('scan-wifi', () => wifi.scan());

ipc.answerRenderer('get-current-wifi', () => wifi.getCurrentConnections());

ipc.answerRenderer('connect-wifi', ({ ssid, password }) => wifi.connect({ ssid, password }));
