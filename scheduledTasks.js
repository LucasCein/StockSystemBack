const cron = require('node-cron');
const eliminarProductosAntiguos = async () => {
    try {
        const result = await pool.query(
            "DELETE FROM products WHERE date < NOW() - INTERVAL '2 days'"
        );
        console.log(`Productos eliminados: ${result.rowCount}`);
    } catch (err) {
        console.error('Error al eliminar productos antiguos:', err);
    }
};

// cron.schedule('0 0 * * *', eliminarProductosAntiguos);

setTimeout(eliminarProductosAntiguos,120000)