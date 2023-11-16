// qrManager.js

const QRCode = require('qrcode');

// function generarURLUnica(idProducto) {
//     return `https://qrsystemback.onrender.com/${idProducto}`;
// }
function generarURLUnica(idProducto) {
    return `https://qrsystemback.onrender.com/${idProducto}`;
}
async function generarQR(idProducto) {
    try {
        const url = generarURLUnica(idProducto);
        const qrCode = await QRCode.toDataURL(url);
        return qrCode;
    } catch (err) {
        console.error(err);
        throw new Error('Fallo al generar el código QR');
    }
}

module.exports = {
    generarQR,
    generarURLUnica
};
