import { Router } from 'express';
import { getObras, createObra } from '../controllers/obrasController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Listar obras (Admin y Operador)
router.get('/', verificarToken, getObras);

// Crear obra (solo Admin)
router.post('/', verificarToken, verificarRol(['admin']), createObra);

export default router;
