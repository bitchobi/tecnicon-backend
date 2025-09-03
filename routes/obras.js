import { Router } from 'express';
import { getObras, createObra, updateObra, deleteObra } from '../controllers/obrasController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Listar obras (Admin y Operador)
router.get('/', verificarToken, getObras);

// Crear obra (solo Admin)
router.post('/', verificarToken, verificarRol(['admin']), createObra);

// Actualizar obra (solo Admin)
router.put('/:id', verificarToken, verificarRol(['admin']), updateObra);

// Eliminar obra (solo Admin)
router.delete('/:id', verificarToken, verificarRol(['admin']), deleteObra);

export default router;
