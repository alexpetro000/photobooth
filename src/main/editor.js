const im = require('imagemagick');

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
    args.push(output);

    await imConvert(args);
    return output;
}

module.exports = {
    process,
};
