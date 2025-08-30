import { Router } from 'express';
import {
  getPresupuestos,
  addPresupuesto,
  obtenerSaldoDisponible,
  crearPresupuesto,           // opcional (rutas anidadas)
  listarPresupuestosDeObra,  // opcional (rutas anidadas)
} from '../controllers/presupuestosController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Saldo disponible por obra+operador
 * GET /presupuestos/disponible/check?id_obra=..&id_operador=..
 * (Debe ir antes que '/:id_obra' para no colisionar)
 */
router.get('/disponible/check', verificarToken, obtenerSaldoDisponible);

/**
 * Listar presupuestos de una obra
 * GET /presupuestos/:id_obra
 */
router.get('/:id_obra', verificarToken, getPresupuestos);

/**
 * Crear presupuesto (inicial/adicional) - solo admin
 * POST /presupuestos
 * Body: { id_obra, id_operador, monto, tipo? }
 */
router.post('/', verificarToken, verificarRol(['admin']), addPresupuesto);

/* ============================
 * Rutas anidadas opcionales (compatibilidad)
 * ============================ */

/**
 * Crear presupuesto tomando id_obra desde params (solo admin)
 * POST /presupuestos/obras/:id_obra
 */
router.post('/obras/:id_obra', verificarToken, verificarRol(['admin']), crearPresupuesto);

/**
 * Listar presupuestos de una obra (compatibilidad)
 * GET /presupuestos/obras/:id_obra
 */
router.get('/obras/:id_obra', verificarToken, listarPresupuestosDeObra);

export default router;
