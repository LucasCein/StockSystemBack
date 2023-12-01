// qrManager.js

const QRCode = require('qrcode');

// function generarURLUnica(idProducto) {
//     https://qrsystemfront.onrender.com/productos;
// }
function generarURLUnica(idProducto) {
    return `https://localhost:5173/${idProducto}`;
}
async function generarQR(idProducto) {
    try {
        const url = generarURLUnica(idProducto);
        const qrOptions = {
            scale: 50, // Ajusta este valor según sea necesario
            margin: 2,
            color: {
                dark: "#000000",  // Puntos del QR
                light: "#FFFFFF" // Fondo del QR
            }
        };
        const qrCode = await QRCode.toDataURL(url, qrOptions);
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
