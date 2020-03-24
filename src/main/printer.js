// const escpos = require('escpos');
// escpos.USB = require('escpos-usb');
//
// const utils = require('./utils');
//
// // Select the adapter based on your printer type
// const device = new escpos.USB(+utils.config.state.printer.vendorId,
//     +utils.config.state.printer.deviceId);
// const printer = new escpos.Printer(device, options);
//
// function printQr(url) {
//     device.open((error) => {
//         printer
//             .font('a')
//             .align('ct')
//             .size(1, 1)
//             .encode('utf8')
//             .text('QR code example')
//             .align('ct')
//             .qrimage('https://pxe.la', function (err) {
//                 this.cut()
//                     .close();
//             });
//     });
// }
