const { app, protocol } = require('electron');
const { ipcMain: ipc } = require('electron-better-ipc');
const path = require('path');
const wifi = require('node-wifi');

const utils = require('./utils');
const camera = require('./camera');
const editor = require('./editor');
const uploader = require('./uploader');
const printer = require('./printer');
const simpleToken = require('./simpleToken');

const protocolName = 'content';

wifi.init({
    iface: utils.config.state.wifiIface,
});

protocol.registerSchemesAsPrivileged([{
    scheme: protocolName,
    privileges: { secure: true, standard: true, supportFetchAPI: true },
}]);

app.on('ready', () => {
    protocol.registerFileProtocol(protocolName, (request, callback) => {
        const url = request.url.substr(protocolName.length + 3).split('?')[0];
        callback({ path: path.join(utils.photosDir, url) });
    });
});

ipc.answerRenderer('process-photo', async (options) => {
    const photoPath = await editor.processPhoto(options);
    return protocolName + '://' + photoPath + '?t=' + Date.now();
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

ipc.answerRenderer('save-preset', ({ name, preset }) => {
    utils.session.state.find((p) => p.name === name).preset = preset;
});

ipc.answerRenderer('commit-session', async () => {
    console.log('commit-session');
    const token = simpleToken.gen(utils.config.state.web.secret);
    const url = utils.config.state.web.receiptUrl
        .replace(/\${token}/g, token)
        .replace(/\${name}/g, utils.config.state.web.name);
    await printer.printReceipt(url);
    uploader.commitSession(token, utils.session.clone());
    utils.session.clear();
    return true;
});

ipc.answerRenderer('delete-photo', (photo) => {
    console.log('delete-photo');
    utils.deleteFiles(photo.name);
    const newState = utils.session.state.filter((item) => item.name !== photo.name);
    console.log('newState', newState);
    utils.session.state = newState;
});

ipc.answerRenderer('save-default-preset', (preset) => {
    utils.preset.state.default = preset;
});

ipc.answerRenderer('fetch-default-preset', async () => utils.preset.clone().default);

ipc.answerRenderer('scan-wifi', () => wifi.scan());
ipc.answerRenderer('get-current-wifi', () => wifi.getCurrentConnections());
ipc.answerRenderer('connect-wifi', ({ ssid, password }) => wifi.connect({ ssid, password }));

setTimeout(uploader.startUpload, 2000);
