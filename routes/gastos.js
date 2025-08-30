import { Router } from 'express';
import { getGastos, addGasto, getGastosAll } from '../controllers/gastosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // ✅ Importar Multer

const router = Router();

// ✅ GET /gastos  -> todos los gastos
router.get('/', verificarToken, getGastosAll);

// ✅ GET /gastos/:id_obra -> gastos por obra (compatibilidad)
router.get('/:id_obra', verificarToken, getGastos);

// ✅ POST /gastos -> crear gasto (con imágenes)
router.post('/', verificarToken, upload.array('imagenes', 5), addGasto);

export default router;
