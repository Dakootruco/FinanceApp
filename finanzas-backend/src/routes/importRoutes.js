import express from 'express';
import multer from 'multer';
import { parsePDFStatement, bulkInsertTransactions } from '../controllers/importController.js';

const router = express.Router();

// Configurar multer para almacenar el archivo temporalmente en memoria (RAM) como Buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Limitar tamaño del archivo PDF a 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo inválido. Solo se admiten archivos PDF.'), false);
    }
  }
});

// Ruta para subir y parsear el PDF del estado de cuenta
router.post('/import-pdf', upload.single('file'), parsePDFStatement);

// Ruta para guardar múltiples transacciones confirmadas en lote
router.post('/bulk', bulkInsertTransactions);

export default router;
