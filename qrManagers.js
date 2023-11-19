// qrManager.js

const QRCode = require('qrcode');

// function generarURLUnica(idProducto) {
//     https://qrsystemfront.onrender.com/productos;
// }
function generarURLUnica(idProducto) {
    return `https://qrsystemfront.onrender.com/products/${idProducto}`;
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
