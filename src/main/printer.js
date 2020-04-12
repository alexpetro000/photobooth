const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const path = require('path');
const fsPromises = require('fs').promises;

const utils = require('./utils');

const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: utils.config.state.printer.iface,
    lineCharacter: utils.config.state.printer.lineCharacter || '-',
});

async function printReceipt(token) {
    const args = { token, printer };

    args.dir = path.join(utils.userDir, 'printer/');

    const receipt = await fsPromises.readFile(path.join(args.dir, 'receipt.js'));
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    printer.clear();
    await (new AsyncFunction('args', receipt))(args);
    printer.cut();
    await printer.execute();
}

module.exports = {
    printReceipt,
};
