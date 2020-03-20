module.exports = {
    root: true,

    env: {
        node: true,
    },

    extends: [
        'plugin:vue/essential',
        '@vue/airbnb',
    ],

    parserOptions: {
        parser: 'babel-eslint',
    },

    rules: {
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': ['error', {
            devDependencies: true,
            optionalDependencies: false,
        }],
        indent: ['error', 4],
        'no-underscore-dangle': ['error', { allowAfterThis: true }],
        'prefer-template': 'off',
        'class-methods-use-this': 'off',
        'no-trailing-spaces': ['error', { skipBlankLines: true }],
        'no-param-reassign': 'off',
        'no-else-return': 'off',
    },
};
