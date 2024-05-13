const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const router=express.Router();



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