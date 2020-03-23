const im = require('imagemagick');

function imConvert(args) {
    return new Promise((resolve, reject) => {
        console.log(args);
        im.convert(args, (err, stdout) => {
            console.log(stdout);
            if (err) reject(stdout);
            resolve(stdout);
        });
    });
}

async function proceed(input, options, output) {
    const args = [input];
    /* if ('crop' in options) {
        const { crop } = options;
        args.push('-crop', `${crop.w}x${crop.h}+${crop.x}+${crop.y}`, '+repage');
    } */
    if ('greenKeys' in options) {
        args.push('(', '-clone', '0');
        options.greenKeys.forEach(({ key, fuzz }) => {
            args.push('-transparent', key, '-fuzz', fuzz + '%');
        });
        args.push('-alpha', 'extract');
        if ('erode' in options) args.push('-morphology', 'Erode', `Octagon:${options.erode}`);
        if ('blur' in options) args.push('-blur', `${options.blur}x${options.blur}`);
        args.push(')', '-compose', 'CopyOpacity', '-composite');
    }
    args.push(output);

    await imConvert(args);
    return output;
}

module.exports = {
    proceed,
};
