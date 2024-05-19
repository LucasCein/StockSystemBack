require('dotenv').config();
require('./scheduledTasks');
const express = require('express');
const path = require('path');
const cors = require('cors');

const loginRoutes = require('./login');
const productosRoutes = require('./productoCRUD');
const compare = require('./excelStorage');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'https://stocksystemfront-ecak.onrender.com'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Servir archivos estáticos (importantísimo para tu SPA)
app.use(express.static(path.join(__dirname, 'build')));

// Rutas específicas
app.use(productosRoutes);
app.use(loginRoutes);
app.use(compare);
// Captura todas las demás rutas y redirige a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
console.log('dirname',__dirname)
// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '::', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
