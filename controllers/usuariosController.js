// controllers/usuariosController.js
import { pool } from '../db/connection.js';

/**
 * GET /usuarios/operadores
 * Devuelve { id_usuario, nombre, email } de todos los usuarios con rol 'operador'
 */
export const listarOperadores = async (_req, res) => {
  try {
    const q = `
      SELECT id_usuario, nombre, email
      FROM usuarios
      WHERE rol = 'operador'
      ORDER BY nombre;
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (e) {
    console.error('Error listando operadores:', e);
    res.status(500).json({ error: 'Error al obtener operadores' });
  }
};
