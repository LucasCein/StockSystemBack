require('dotenv').config();
require('./scheduledTasks');
const loginRoutes=require('./login')
const express = require('express');
const productosRoutes = require('./productoCRUD');
const cors = require('cors');

const app = express();

// Middleware para parsear JSON aaaa
app.use(express.json());




//Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'https://stocksystemfront-gsg2.onrender.com'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Para navegadores antiguos que no soportan 204
};

// Aplica CORS antes de tus rutas
app.use(cors(corsOptions));


// Tus rutas
app.use(productosRoutes);
app.use(loginRoutes);
// Un endpoint de prueba para verificar que el servidor funciona
// app.get('/', (req, res) => {
//   res.send('¡El servidor Express está funcionando!');
// });

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '::', () => {
  console.log(`Servidor corriendo en https://stocksystemback-uorn.onrender.com${PORT}`);
});
// app.listen(PORT, '::', () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });