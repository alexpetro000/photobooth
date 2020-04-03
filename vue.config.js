const path = require('path');

module.exports = {
    transpileDependencies: [
        'vuetify',
    ],
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/index.js',
            mainProcessWatch: ['src/main/*'],
            externals: ['gphoto2'],
            chainWebpackRendererProcess: (config) => {
                config
                    .entry('app')
                    .clear()
                    .add('./src/renderer/main.js')
                    .end();
                config.resolve.alias
                    .set('@', path.resolve(__dirname, './src/renderer'));
            },
            builderOptions: {
                linux: {
                    target: {
                        target: 'AppImage',
                        arch: ['armv7l', 'x64'],
                    },
                },
            },
        },
    },
    lintOnSave: false,
};
