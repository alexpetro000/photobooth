const { debounce, cloneDeep } = require('lodash');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const userDir = app.getPath('userData');

function proxify(root, callback) {
    function makeHandler() {
        return {
            set(target, key, value) {
                if (typeof value === 'object' && value !== null) {
                    // eslint-disable-next-line no-use-before-define
                    Reflect.set(target, key, deepProxy(value));
                    callback();
                } else {
                    Reflect.set(target, key, value);
                    callback();
                }
                return true;
            },
            deleteProperty(target, prop) {
                Reflect.deleteProperty(target, prop);
                callback();
                return true;
            },
        };
    }

    function deepProxy(obj) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                obj[key] = deepProxy(obj[key]);
            }
        });
        return new Proxy(obj, makeHandler());
    }

    return deepProxy(root);
}

class Conf {
    constructor(filename, debounceTime = 100) {
        this._file = path.join(userDir, filename);
        const obj = JSON.parse(fs.readFileSync(this._file));
        this.save = debounce(() => {
            fs.writeFileSync(this._file, JSON.stringify(this.state, null, 4));
        }, debounceTime);
        this._state = proxify(obj, this.save);
    }

    clear() {
        if (Array.isArray(this.state)) {
            this.state.length = 0;
        } else {
            this.state = {};
        }
    }

    clone() {
        return cloneDeep(this.state);
    }

    set state(obj) {
        this._state = proxify(obj, this.save);
        this.save();
    }

    get state() {
        return this._state;
    }
}

const configs = {};
function getConf(filename, debounceTime = 100) {
    if (filename in configs) {
        return configs[filename];
    } else {
        configs[filename] = new Conf(filename, debounceTime);
        return configs[filename];
    }
}

module.exports = getConf;
module.exports.userDir = userDir;
module.exports.Conf = Conf;
