import { Router } from 'express';
import { getResumenObra } from '../controllers/dashboardController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

// Solo el administrador puede ver el dashboard
router.get('/resumen/:id_obra', verificarToken, verificarRol(['admin']), getResumenObra);

export default router;
