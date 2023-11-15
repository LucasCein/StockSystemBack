require('dotenv').config();
const express = require('express');
const productosRoutes = require('./productoCRUD');
const cors = require('cors');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173', // o la URL de tu frontend
  optionsSuccessStatus: 200 // Para navegadores legacy que no soportan 204
};

// Aplica CORS antes de tus rutas
app.use(cors(corsOptions));

// Tus rutas
app.use(productosRoutes);

// Un endpoint de prueba para verificar que el servidor funciona
// app.get('/', (req, res) => {
//   res.send('¡El servidor Express está funcionando!');
// });

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '::', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
