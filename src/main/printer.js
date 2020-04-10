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

async function printReceipt(url) {
    const receipt = await fsPromises.readFile(path.join(utils.userDir, 'printer', 'receipt.js'));
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    await (new AsyncFunction('printer', 'url', receipt))(printer, url);
    printer.cut();
    await printer.execute();
}

module.exports = {
    printReceipt,
};
