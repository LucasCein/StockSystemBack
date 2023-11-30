const cron = require('node-cron');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

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

cron.schedule('0 0 * * *', eliminarProductosAntiguos);

