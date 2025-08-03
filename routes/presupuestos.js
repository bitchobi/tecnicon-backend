import { Router } from 'express';
import { getPresupuestos, addPresupuesto } from '../controllers/presupuestosController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Listar presupuestos de una obra (Admin y Operador)
router.get('/:id_obra', verificarToken, getPresupuestos);

// Crear presupuesto adicional o inicial (solo Admin)
router.post('/', verificarToken, verificarRol(['admin']), addPresupuesto);

export default router;
