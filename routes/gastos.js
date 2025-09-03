// routes/gastos.js
import express from 'express';
import { getGastos, addGasto, getGastosAll } from '../controllers/gastosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// GET /gastos - Todos los gastos (usado por Gastos.vue)
router.get('/', getGastosAll);

// GET /gastos/recientes - Gastos recientes para el dashboard
router.get('/recientes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const { pool } = await import('../db/connection.js');
    
    const query = `
      SELECT 
        g.id_gasto,
        g.monto,
        g.descripcion,
        g.categoria,
        g.fecha,
        o.nombre as obra,
        u.nombre as operador
      FROM gastos g
      LEFT JOIN obras o ON o.id_obra = g.id_obra
      LEFT JOIN usuarios u ON u.id_usuario = g.id_operador
      ORDER BY g.fecha DESC
      LIMIT $1;
    `;
    
    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo gastos recientes:', error);
    res.status(500).json({ error: 'Error al obtener gastos recientes' });
  }
});

// GET /gastos/obra/:id_obra - Gastos por obra específica
router.get('/obra/:id_obra', getGastos);

// POST /gastos - Crear nuevo gasto con archivos
router.post('/', uploadMiddleware, addGasto);

export default router;