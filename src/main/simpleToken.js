const md5 = require('js-md5');

function gen(secret) {
    const d = Math.floor(Date.now() / 1000).toString(36);
    const hash = ('0000' + parseInt(md5(d + secret).slice(0, 6), 16).toString(36))
        .slice(-4);
    return d + hash;
}

function verify(token, secret) {
    const hash = ('0000' + parseInt(md5(token.slice(0, -4) + secret).slice(0, 6), 16)
        .toString(36)).slice(-4);
    return hash === token.slice(-4);
}

module.exports = {
    gen,
    verify,
};
