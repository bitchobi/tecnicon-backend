import { Router } from 'express';
import { getGastos, addGasto } from '../controllers/gastosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // ✅ Importar Multer

const router = Router();

// Obtener gastos de una obra (Admin y Operador)
router.get('/:id_obra', verificarToken, getGastos);

// Registrar un gasto con imágenes (Admin y Operador)
router.post(
  '/',
  verificarToken,
  upload.array('imagenes', 5), // ✅ hasta 5 imágenes
  addGasto
);

export default router;
