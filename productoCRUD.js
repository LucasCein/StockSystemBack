const express = require('express');
const { generarQR } = require('./qrManagers');

const router = express.Router();

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

router.get('/products/suggest', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articulos');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

console.log(pool.options);

router.get('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE productid = $1', [req.params.id]);
        
        // Verifica si el producto existe
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        const producto = result.rows[0];
        const qrCode = await generarQR(producto.productid); // Genera el QR

        // Agrega el código QR al objeto del producto
        producto.qrCode = qrCode;

        res.json(producto);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//ver desde aca pa abajo
router.post('/products', async (req, res) => {
    try {
        const { name, code, codbarras, codprov, quantityb,quantityu, date, idealstock, unxcaja, total } = req.body;
        const result = await pool.query(
            'INSERT INTO products(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total]
        );

        const nuevoproductid = result.rows[0].productid;
        const qrCode = await generarQR(nuevoproductid);

        res.status(201).json({ nuevoproductid, qrCode });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

router.put('/products', async (req, res) => {
    try {
        const { name, code, codbarras, codprov, quantityu, quantityb, date, idealstock, productid, unxcaja, total } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, code = $2, codbarras = $3, codprov = $4, date = $5, quantityu = $6, quantityb = $7, idealstock = $8, unxcaja = $9, total = $10 WHERE productid = $11 RETURNING *',
            [name, code, codbarras, codprov,  date, quantityu, quantityb, idealstock, unxcaja, total, productid]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete('/products/:id', async (req, res) => {

    try {
        const result = await pool.query('DELETE FROM products WHERE productid = $1', [req.params.id]);
        
        if (result.rowCount === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.send(`Producto con ID: ${req.params.id} eliminado`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
