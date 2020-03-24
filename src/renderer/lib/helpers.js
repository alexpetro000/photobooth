import { cloneDeep, isEqual } from 'lodash';

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) {
        throw new Error('Invalid color component');
    }
    // eslint-disable-next-line no-bitwise
    return '#' + ('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
}

function leadPreset(preset) {
    if (preset === undefined) preset = {};
    else preset = cloneDeep(preset);

    if (!('greenKeys' in preset)) preset.greenKeys = [];
    if (!('crop' in preset)) preset.crop = {};
    if (!('pos' in preset)) preset.pos = {};
    if (!('erode' in preset)) preset.erode = 0;
    if (!('blur' in preset)) preset.blur = 0;

    return preset;
}

function arePresetsEqual(preset1, preset2) {
    return isEqual(leadPreset(preset1), leadPreset(preset2));
}

export {
    rgbToHex,
    leadPreset,
    arePresetsEqual,
};
