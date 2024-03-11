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
// router.get('/products', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM products');
//         res.json(result.rows);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT
        name,
        code,
        codbarras,
        codprov,
        date,
        unxcaja,
        SUM(quantityb) AS quantityb,
        SUM(quantityu) AS quantityu,
        SUM(quantityb * unxcaja + quantityu) AS total,
        familia
    FROM 
        Products
    GROUP BY 
        code, name, codbarras, codprov, date, unxcaja, familia
        `);
        console.log(result)
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/products/:username', async (req, res) => {
    try {
        // Usa el operador ANY para buscar el username dentro del array username de la tabla
        const result = await pool.query('SELECT * FROM products WHERE $1 = ANY(username)', [req.params.username]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

console.log(pool.options);

router.get('/products/edit/:id', async (req, res) => {
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
        console.log(producto)
        res.json(producto);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// router.post('/products', async (req, res) =>{
//     try {
//         const {artid,userid,quantityb,quantityu}=req.body
//         const result = await pool.query(
//             'INSERT INTO productosusuarios(productoid,userid,quantityb,quantityu) VALUES($1, $2, $3, $4) RETURNING *',
//             [artid,userid,quantityb,quantityu]
//         );
//         res.json(result.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send(error.message);
//     }
// })
router.post('/products', async (req, res) => {
    try {
        const { name, code, codbarras, codprov, quantityb, quantityu, date, idealstock, unxcaja, total, familia, username } = req.body;
        const result = await pool.query(
            'INSERT INTO products(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia, username) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia, username]
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
        const { name, code, codbarras, codprov, quantityu, quantityb, date, idealstock, productid, unxcaja, total, familia, username } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, code = $2, codbarras = $3, codprov = $4, date = $5, quantityu = $6, quantityb = $7, idealstock = $8, unxcaja = $9, total = $10, familia = $11, username = $12 WHERE productid = $13 RETURNING *',
            [name, code, codbarras, codprov, date, quantityu, quantityb, idealstock, unxcaja, total, familia, username, productid]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete('/products/edit/:id', async (req, res) => {

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



//post pa productos admin

router.post('/productos/admin', async (req, res) => {
    try {
        const productos = req.body; // `productos` debería ser un array de productos.
        const resultados = [];

        for (const producto of productos) {
            const { name, code, codbarras, codprov, quantityb, quantityu, date, idealstock, unxcaja, total, familia } = producto;

            // Primero, verificar si ya existe un producto con el mismo código.
            const existsResult = await pool.query(
                'SELECT * FROM productsadmin WHERE code = $1',
                [code]
            );

            if (existsResult.rows.length === 0) {
                // El producto no existe, proceder con la inserción.
                const result = await pool.query(
                    'INSERT INTO productsadmin(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
                    [name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia]
                );
                resultados.push(result.rows[0]); // Producto insertado
            } 
        }

        res.json(resultados); // Envía todos los productos insertados o existentes como respuesta.
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});



router.get('/productos/admin', async (req,res) =>{
    try {
        const result = await pool.query('SELECT * FROM productsadmin');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
})



module.exports = router;
