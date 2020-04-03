const im = require('imagemagick');
const path = require('path');

const utils = require('./utils');

function imConvert(args) {
    return new Promise((resolve, reject) => {
        console.log(args.join(' '));
        im.convert(args, (err, stdout) => {
            console.log(stdout);
            if (err) reject(stdout);
            resolve(stdout);
        });
    });
}

async function process(input, preset, output) {
    console.log('processing:', preset);
    const args = [input];
    if ('crop' in preset) {
        const { crop } = preset;
        let cropParams = '';
        if (crop.w) cropParams += Math.round(crop.w);
        cropParams += 'x';
        if (crop.h) cropParams += Math.round(crop.h);
        cropParams += `+${Math.round(crop.x) || 0}+${Math.round(crop.y) || 0}`;

        args.push('-crop', cropParams, '+repage');
    }
    if ('chromakey' in preset) {
        args.push('(', '-clone', '0');
        if ('points' in preset.chromakey) {
            preset.chromakey.points.forEach(({ color, fuzz }) => {
                args.push('-fuzz', fuzz + '%', '-transparent', color);
            });
            args.push('-alpha', 'extract');
        }
        if ('shift' in preset.chromakey) {
            args.push('-morphology', 'Erode', `Octagon:${preset.chromakey.shift}`);
        }
        if ('smooth' in preset.chromakey) {
            args.push('-blur', `${preset.chromakey.smooth}x${preset.chromakey.smooth}`);
        }

        args.push(')', '-compose', 'CopyOpacity', '-composite');
    }

    if ('pos' in preset) {
        if ('scale' in preset.pos) {
            const scale = Math.round((preset.pos.scale || 1) * 100);
            args.push('-resize', `${scale}%`);
        }

        const templates = path.join(utils.photosDir, 'templates');
        const bg = path.join(templates, 'bg.jpg');
        const fg = path.join(templates, 'fg.png');

        const posX = Math.round(preset.pos.x) || 0;
        const posY = Math.round(preset.pos.y) || 0;

        args.unshift(bg, '(');
        args.push(')', '-geometry',
            `+${posX}+${posY}`,
            '-compose', 'Over', '-composite');

        args.push(fg, '-geometry', '+0+0', '-compose', 'Over', '-composite');
    }

    args.push(output);
    await imConvert(args);
    return output;
}

module.exports = {
    process,
};
