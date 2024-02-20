const express = require('express');

const router = express.Router();

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

// router.get('/login', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM users');
//         res.json(result.rows);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });
// En tu archivo del backend
router.post('/login', async (req, res) => {
  try {
      const { name, password } = req.body;
      // Asegúrate de seleccionar el userid en tu consulta
      const result = await pool.query('SELECT userid, name FROM users WHERE name = $1 AND password = $2', [name, password]);
      if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
      // Devuelve el userid y cualquier otro dato que necesites en la respuesta
      const user = result.rows[0]; // Asumiendo que solo hay una coincidencia, lo cual debería ser cierto para pares únicos de nombre/contraseña
      res.json({ message: 'Login exitoso', userid: user.userid, name: user.name });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});



module.exports = router;