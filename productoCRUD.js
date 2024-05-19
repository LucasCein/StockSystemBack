const express = require("express");
const { generarQR } = require("./qrManagers");

const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.get("/products/suggest", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articulos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.get("/allproducts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.get("/products", async (req, res) => {
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
        familia,
        marca
    FROM 
        Products
    GROUP BY 
        code, name, codbarras, codprov, date, unxcaja, familia, marca
        `);
    console.log(result);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/products/:username", async (req, res) => {
  try {
    // Usa el operador ANY para buscar el username dentro del array username de la tabla
    const result = await pool.query(
      "SELECT * FROM products WHERE $1 = ANY(username)",
      [req.params.username]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

console.log(pool.options);

router.get("/products/edit/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE productid = $1",
      [req.params.id]
    );

    // Verifica si el producto existe
    if (result.rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    const producto = result.rows[0];
    const qrCode = await generarQR(producto.productid); // Genera el QR

    // Agrega el código QR al objeto del producto
    producto.qrCode = qrCode;
    console.log(producto);
    res.json(producto);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/products/edit/:id/:username", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE code = $1 AND $2 = ANY(username)",
      [req.params.id, req.params.username]
    );

    // Verifica si el producto existe
    if (result.rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    const producto = result.rows[0];
    res.json(producto);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/products/edit/:id/:username", async (req, res) => {
  try {
    const { quantityb, quantityu, total } = req.body;
    const result = await pool.query(
      "UPDATE products SET quantityb = $1, quantityu = $2, total = $3 WHERE code = $4 and $5 = ANY(username) RETURNING *",
      [quantityb, quantityu, total, req.params.id, req.params.username]
    );

    // Verifica si el producto existe
    if (result.rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    const producto = result.rows[0];
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
router.post("/products", async (req, res) => {
  try {
    const {
      name,
      code,
      codbarras,
      codprov,
      quantityb,
      quantityu,
      date,
      idealstock,
      unxcaja,
      total,
      familia,
      marca,
      username,
    } = req.body;
    const result = await pool.query(
      "INSERT INTO products(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia, marca, username) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        name,
        code,
        codbarras,
        codprov,
        date,
        quantityb,
        quantityu,
        idealstock,
        unxcaja,
        total,
        familia,
        marca,
        username,
      ]
    );

    const nuevoproductid = result.rows[0].productid;
    const qrCode = await generarQR(nuevoproductid);

    res.status(201).json({ nuevoproductid, qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.put("/products", async (req, res) => {
  try {
    const {
      name,
      code,
      codbarras,
      codprov,
      quantityu,
      quantityb,
      date,
      idealstock,
      productid,
      unxcaja,
      total,
      familia,
      marca,
      username,
    } = req.body;
    const result = await pool.query(
      "UPDATE products SET name = $1, code = $2, codbarras = $3, codprov = $4, date = $5, quantityu = $6, quantityb = $7, idealstock = $8, unxcaja = $9, total = $10, familia = $11, marca = $12, username = $13 WHERE productid = $14 RETURNING *",
      [
        name,
        code,
        codbarras,
        codprov,
        date,
        quantityu,
        quantityb,
        idealstock,
        unxcaja,
        total,
        familia,
        marca,
        username,
        productid,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/products", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products");
    res.send("Productos Eliminados");
  } catch (error) {
    res.status(500).send(err.message);
  }
});

router.delete("/products/edit/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE productid = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    res.send(`Producto con ID: ${req.params.id} eliminado`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//post pa productos admin

router.post("/productos/admin", async (req, res) => {
  try {
    // Acepta tanto un solo producto como un array de productos.
    let productos = req.body;
    // Si `productos` no es un array, conviértelo en uno para simplificar el manejo.
    if (!Array.isArray(productos)) {
      productos = [productos]; // Envuelve el objeto en un array
    }
    const resultados = [];

    for (const producto of productos) {
      const {
        name,
        code,
        codbarras,
        codprov,
        quantityb,
        quantityu,
        date,
        idealstock,
        unxcaja,
        total,
        familia,
        marca,
      } = producto;

      // Verifica si ya existe un producto con el mismo código.
      const existsResult = await pool.query(
        "SELECT * FROM productsadmin WHERE code = $1",
        [code]
      );

      if (existsResult.rows.length === 0) {
        // El producto no existe, procede con la inserción.
        const result = await pool.query(
          "INSERT INTO productsadmin(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia, marca) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
          [
            name,
            code,
            codbarras,
            codprov,
            date,
            quantityb,
            quantityu,
            idealstock,
            unxcaja,
            total,
            familia,
            marca,
          ]
        );
        resultados.push(result.rows[0]); // Producto insertado
      }
    }

    res.json(resultados); // Envía todos los productos insertados como respuesta.
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

//agregar de a 1

router.put("/productos/admin", async (req, res) => {
  try {
    const {
      name,
      code,
      codbarras,
      codprov,
      quantityu,
      quantityb,
      date,
      idealstock,
      productid,
      unxcaja,
      total,
      familia,
    } = req.body;
    const result = await pool.query(
      "UPDATE productsadmin SET name = $1, code = $2, codbarras = $3, codprov = $4, date = $5, quantityu = $6, quantityb = $7, idealstock = $8, unxcaja = $9, total = $10, familia = $11 WHERE productid = $12 RETURNING *",
      [
        name,
        code,
        codbarras,
        codprov,
        date,
        quantityu,
        quantityb,
        idealstock,
        unxcaja,
        total,
        familia,
        productid,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/productos/admin", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productsadmin");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.delete("/productos/admin", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM productsadmin");
    res.send("Productos Eliminados");
  } catch (error) {
    res.status(500).send(err.message);
  }
});

router.get("/productos/admin/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productsadmin WHERE productid = $1",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/productos/admin/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM productsadmin WHERE productid = $1",
      [req.params.id]
    );
    res.send(`Producto con ID: ${req.params.id} eliminado`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//get usernames

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name FROM users where name != 'admin'"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//agregar productos al historial para poder borrarlos despues de la tabla ppal

router.post("/historial", async (req, res) => {
  try {
    // Acepta tanto un solo producto como un array de productos.
    let productos = req.body;
    // Si `productos` no es un array, conviértelo en uno para simplificar el manejo.
    if (!Array.isArray(productos)) {
      productos = [productos]; // Envuelve el objeto en un array
    }
    const resultados = [];

    for (const producto of productos) {
      const {
        name,
        code,
        codbarras,
        codprov,
        quantityb,
        quantityu,
        date,
        idealstock,
        unxcaja,
        total,
        familia,
        marca,
        username,
      } = producto;

      // Verifica si ya existe un producto con el mismo código.
      const existsResult = await pool.query(
        "SELECT * FROM historial WHERE code = $1 AND $2 = ANY(username)",
        [code, username]
      );

      if (existsResult.rows.length === 0) {
        // El producto no existe, procede con la inserción.
        const result = await pool.query(
          "INSERT INTO historial(name, code, codbarras, codprov, date, quantityb, quantityu, idealstock, unxcaja, total, familia, marca, username) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
          [
            name,
            code,
            codbarras,
            codprov,
            date,
            quantityb,
            quantityu,
            idealstock,
            unxcaja,
            total,
            familia,
            marca,
            username,
          ]
        );
        resultados.push(result.rows[0]); // Producto insertado
      }
    }

    res.json(resultados); // Envía todos los productos insertados como respuesta.
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.get("/historial/:username", async (req, res) => {
  try {
    // Usa el operador ANY para buscar el username dentro del array username de la tabla
    const result = await pool.query(
      "SELECT * FROM historial WHERE $1 = ANY(username)",
      [req.params.username]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/excelstock", async (req, res) => {
  const stockprods = req.body;
  const resultados = [];
  try {
    for (const prod of stockprods) {
      const { code, codbarras, descripcion, marca, unxcaja, stockdep } = prod;
      const result = await pool.query(
        "INSERT INTO stockexcel(code,codbarras,descripcion,marca,unxcaja,stockdep) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        [code, codbarras, descripcion, marca, unxcaja, stockdep]
      );
      resultados.push(result.rows[0]);
    }
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }

  // try {
  //     const result = await pool.query(
  //         'INSERT INTO stockexcel(code,codbarras,descripcion,marca,unxcaja,costo,stockdep) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
  //         [code,codbarras,descripcion,marca,unxcaja,costo,stockdep]
  //     );
  //     res.json(result.rows[0]);
  // } catch (error) {
  //     res.status(500).send(error.message);
  // }
});

router.get("/excelstock", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stockexcel");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/comparar/planillasistema", async (req, res) => {
  const rows = req.body;

  try {
    const insertPromises = rows.map((row) => {
      return pool.query(
        `INSERT INTO planillasistema (code, codbarras, descripcion, marca, unxcaja, total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          row.code,
          row.codbarras,
          row.descripcion,
          row.marca,
          row.unxcaja,
          row.total,
        ]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/comparar/planillasistema", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM planillasistema");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/comparar/planillaoperador", async (req, res) => {
  const { headers, data } = req.body;

  try {
    const insertPromises = data.map((row) => {
      return pool.query(
        `INSERT INTO planillaoperador (code, codbarras, descripcion, marca, unxcaja, quantityu, quanitityb, total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/comparar/planillaoperador", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM planillaoperador");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// In your server.js or app.js
app.delete('/comparar/clear-data', async (req, res) => {
    try {
      await pool.query('DELETE FROM planillasistema');
      await pool.query('DELETE FROM planillaoperador');
      res.status(200).json({ message: 'Data cleared successfully' });
    } catch (error) {
      console.error('Error clearing data', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
module.exports = router;
