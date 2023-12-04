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
      const result = await pool.query('SELECT * FROM users WHERE name = $1 AND password = $2', [name, password]);
      if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
      res.json({ message: 'Login exitoso' });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});


module.exports = router;