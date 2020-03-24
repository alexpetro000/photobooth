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
    /* if ('crop' in preset) {
        const { crop } = preset;
        args.push('-crop', `${crop.w}x${crop.h}+${crop.x}+${crop.y}`, '+repage');
    } */
    if ('greenKeys' in preset) {
        args.push('(', '-clone', '0');
        preset.greenKeys.forEach(({ color, fuzz }) => {
            args.push('-fuzz', fuzz + '%', '-transparent', color);
        });
        args.push('-alpha', 'extract');
        if ('erode' in preset) args.push('-morphology', 'Erode', `Octagon:${preset.erode}`);
        if ('blur' in preset) args.push('-blur', `${preset.blur}x${preset.blur}`);
        args.push(')', '-compose', 'CopyOpacity', '-composite');
    }

    if ('pos' in preset) {
        const templates = path.join(utils.photosDir, 'templates');
        const bg = path.join(templates, 'bg.png');
        const fg = path.join(templates, 'fg.png');

        const posX = Math.floor(preset.pos.x); // || (canvas.width - cropW) / 2);
        const posY = Math.floor(preset.pos.y); // || (canvas.height - cropH) / 2);

        args.unshift(bg, '(');
        args.push(')', '-geometry',
            `${posX >= 0 ? '+' : '-'}${posX}${posY >= 0 ? '+' : '-'}${posY}`,
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
