import { pool } from '../db/connection.js';

export const getPresupuestos = async (req, res) => {
  const { id_obra } = req.params;

  try {
    const query = `
      SELECT * 
      FROM presupuestos 
      WHERE id_obra = $1
      ORDER BY fecha_creacion DESC;
    `;
    const result = await pool.query(query, [id_obra]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo presupuestos:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
};

export const addPresupuesto = async (req, res) => {
  const { id_obra, id_operador, monto, tipo } = req.body;

  try {
    const query = `
      INSERT INTO presupuestos (id_obra, id_operador, monto, tipo, fecha_creacion)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [id_obra, id_operador, monto, tipo]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error agregando presupuesto:', error);
    res.status(500).json({ error: 'Error al agregar presupuesto' });
  }
};
