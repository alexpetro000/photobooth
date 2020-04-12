const path = require('path');
const fs = require('fs');

const Conf = require('./conf');

const config = Conf('config.json');
const session = Conf('session.json');
const upload = Conf('upload.json');
const preset = Conf('preset.json');

const photosDir = path.join(Conf.userDir, config.state.photosDir);
const photosOrigDir = path.join(photosDir, 'originals');
const photosEditedDir = path.join(photosDir, 'edited');
const photosTmpDir = path.join(photosDir, 'tmp');
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir);
if (!fs.existsSync(photosOrigDir)) fs.mkdirSync(photosOrigDir);
if (!fs.existsSync(photosEditedDir)) fs.mkdirSync(photosEditedDir);
if (!fs.existsSync(photosTmpDir)) fs.mkdirSync(photosTmpDir);

function getTimestamp(now = new Date()) {
    const secs = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    const mins = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    const date = now.getDate() < 10 ? '0' + String(now.getDate()) : String(now.getDate());
    const month = (now.getMonth() + 1) < 10 ? '0' + String(now.getMonth() + 1) : String(now.getMonth() + 1);
    const year = String(now.getFullYear());

    return year + month + date + '_' + hours + '-' + mins + '-' + secs;
}

function getDate(now) {
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
}

function getRandomString() {
    return Math.random().toString(36).substring(2);
}

function deleteFiles(name) {
    const logError = () => {};
    fs.unlink(path.join(photosDir, 'originals', name + '.jpg'), logError);
    fs.unlink(path.join(photosDir, 'edited', name + '.jpg'), logError);
    fs.unlink(path.join(photosDir, 'edited', name + '.json'), logError);
    fs.unlink(path.join(photosDir, 'tmp', name + '.png'), logError);
    fs.unlink(path.join(photosDir, 'tmp', name + '.json'), logError);
}

module.exports = {
    getTimestamp,
    getDate,
    getRandomString,
    userDir: Conf.userDir,
    deleteFiles,
    photosDir,
    config,
    session,
    upload,
    preset,
};
