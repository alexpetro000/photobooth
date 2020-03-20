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
                    .set('@', path.join(__dirname, './src/renderer'));
            },
        },
    },
    lintOnSave: false,
};
