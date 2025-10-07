const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');  // Para multipart/form-data en Node.js

// Configuración de multer para uploads temporales (usa la misma que en server.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/');  // Usa uploads/ del backend
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ruta POST /analyze-image: Recibe imagen del frontend, envía a Flask ML, retorna JSON
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    const imagePath = req.file.path;
    console.log(`Procesando imagen: ${imagePath}`);

    // Crea FormData para enviar al servicio Flask (puerto 5001)
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    // Envía la imagen al servicio ML (Flask)
    const mlResponse = await axios.post('http://localhost:5001/analyze', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    // Limpia archivo temporal para no acumular espacio
    fs.unlinkSync(imagePath);
    console.log('Análisis ML completado y archivo temporal limpiado');

    // Retorna el JSON del ML al frontend
    res.json(mlResponse.data);
  } catch (error) {
    console.error('Error en análisis ML:', error.message);
    // Limpia temp si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error.response) {
      // Error del ML (ej: Flask no corriendo)
      res.status(error.response.status).json({ error: error.response.data.error || 'Error en servicio ML' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor Node.js' });
    }
  }
});

module.exports = router;
