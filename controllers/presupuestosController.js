// controllers/presupuestosController.js
import { pool } from '../db/connection.js';

/**
 * GET /presupuestos/:id_obra
 * Lista los presupuestos de una obra, incluyendo el nombre del operador.
 */
export const getPresupuestos = async (req, res) => {
  const { id_obra } = req.params;

  if (!id_obra) {
    return res.status(400).json({ error: 'id_obra es obligatorio' });
  }

  try {
    const query = `
      SELECT 
        p.*,
        u.nombre AS operador_nombre
      FROM presupuestos p
      LEFT JOIN usuarios u ON u.id_usuario = p.id_operador
      WHERE p.id_obra = $1
      ORDER BY p.fecha_creacion DESC, p.id_presupuesto DESC;
    `;
    const result = await pool.query(query, [id_obra]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo presupuestos:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
};

/**
 * POST /presupuestos   (solo admin vía middleware)
 * Crea un presupuesto (inicial o adicional) para una obra y operador.
 * Body: { id_obra, id_operador, monto, tipo? = 'inicial' }
 */
export const addPresupuesto = async (req, res) => {
  let { id_obra, id_operador, monto, tipo = 'inicial' } = req.body;

  if (!id_obra || !id_operador || monto == null) {
    return res.status(400).json({ error: 'id_obra, id_operador y monto son obligatorios' });
  }

  // Normalizaciones
  tipo = String(tipo || '').toLowerCase();
  if (!['inicial', 'adicional'].includes(tipo)) tipo = 'inicial';

  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ error: 'monto inválido' });
  }

  try {
    const query = `
      INSERT INTO presupuestos (id_obra, id_operador, monto, tipo, fecha_creacion)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const params = [id_obra, id_operador, montoNum, tipo];
    const result = await pool.query(query, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error agregando presupuesto:', error);
    res.status(500).json({ error: 'Error al agregar presupuesto' });
  }
};

/**
 * GET /presupuestos/disponible/check?id_obra=..&id_operador=..
 * Devuelve { presupuesto_total, gasto_total, presupuesto_disponible } para la combinación.
 * Requiere una vista (o subconsulta) llamada vista_presupuesto_operador.
 */
export const obtenerSaldoDisponible = async (req, res) => {
  const { id_obra, id_operador } = req.query;

  if (!id_obra || !id_operador) {
    return res.status(400).json({ error: 'id_obra e id_operador son obligatorios' });
  }

  try {
    // Se asume que ya existe la vista vista_presupuesto_operador
    // con columnas: id_obra, id_operador, presupuesto_total, gasto_total, presupuesto_disponible
    const q = `
      SELECT *
      FROM vista_presupuesto_operador
      WHERE id_obra = $1 AND id_operador = $2
      LIMIT 1;
    `;
    const r = await pool.query(q, [id_obra, id_operador]);

    res.json(
      r.rows[0] || {
        id_obra,
        id_operador,
        presupuesto_total: 0,
        gasto_total: 0,
        presupuesto_disponible: 0,
      }
    );
  } catch (e) {
    console.error('Error consultando saldo disponible:', e);
    res.status(500).json({ error: 'Error al consultar saldo disponible' });
  }
};

/* ============================
 * Compatibilidad opcional con rutas anidadas /obras/:id_obra/presupuestos
 * (Si decides exponer también estos endpoints)
 * ============================ */

/**
 * POST /obras/:id_obra/presupuestos  (solo admin)
 * Igual que addPresupuesto, pero tomando id_obra desde params.
 */
export const crearPresupuesto = async (req, res) => {
  const { id_obra } = req.params;
  let { id_operador, monto, tipo = 'inicial' } = req.body;

  if (!id_obra || !id_operador || monto == null) {
    return res.status(400).json({ error: 'id_obra, id_operador y monto son obligatorios' });
  }

  tipo = String(tipo || '').toLowerCase();
  if (!['inicial', 'adicional'].includes(tipo)) tipo = 'inicial';

  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ error: 'monto inválido' });
  }

  try {
    const q = `
      INSERT INTO presupuestos (id_obra, id_operador, monto, tipo, fecha_creacion)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const r = await pool.query(q, [id_obra, id_operador, montoNum, tipo]);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('Error creando presupuesto:', e);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
};

/**
 * GET /obras/:id_obra/presupuestos
 * Igual que getPresupuestos, pero mantenido por compatibilidad.
 */
export const listarPresupuestosDeObra = async (req, res) => {
  const { id_obra } = req.params;
  if (!id_obra) return res.status(400).json({ error: 'id_obra es obligatorio' });

  try {
    const q = `
      SELECT 
        p.*,
        u.nombre AS operador_nombre
      FROM presupuestos p
      LEFT JOIN usuarios u ON u.id_usuario = p.id_operador
      WHERE p.id_obra = $1
      ORDER BY p.fecha_creacion DESC, p.id_presupuesto DESC;
    `;
    const r = await pool.query(q, [id_obra]);
    res.json(r.rows);
  } catch (e) {
    console.error('Error listando presupuestos:', e);
    res.status(500).json({ error: 'Error al listar presupuestos' });
  }
};
