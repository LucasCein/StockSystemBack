const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const router=express.Router();

const FILE_LIFETIME = 60 * 60 * 1000

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "/uploads/");
    fs.mkdirSync(uploadPath, { recursive: true }); // Asegúrate de que el directorio exista
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4(); // Crea un UUID para el archivo
    cb(null, fileId + path.extname(file.originalname)); // Guarda el archivo con el UUID como nombre
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), (req, res) => {
  res.json({ message: "Archivo subido con éxito", fileId: req.file.filename });
});

app.post('/json', (req, res) => {
  const { headers, data } = req.body;
  const fileId = Date.now(); // Generar un ID único para el archivo

  // Crear el contenido del archivo JSON
  const jsonData = {
    headers: headers,
    data: data
  };

  // Definir la ruta del archivo
  const filePath = path.join(__dirname, `data_${fileId}.json`);

  // Guardar el archivo JSON
  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Programar la eliminación del archivo después de FILE_LIFETIME milisegundos
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`File ${filePath} deleted successfully.`);
        }
      });
    }, FILE_LIFETIME);

    res.status(200).json({ fileId: fileId });
  });
});

app.get('/json/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const filePath = path.join(__dirname, `data_${fileId}.json`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  });
});

router.get('/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const filePath = path.join(__dirname, '/uploads/', fileId);
  
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.status(404).send('Archivo no encontrado');
        return;
      }
      res.send(data); // Envía los datos del archivo como respuesta
    });
  });

module.exports=router