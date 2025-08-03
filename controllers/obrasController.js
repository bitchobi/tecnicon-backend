import { pool } from '../db/connection.js';

export const getObras = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM obras ORDER BY id_obra DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo obras:', error);
    res.status(500).json({ error: 'Error al obtener obras' });
  }
};

export const createObra = async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, presupuesto_total } = req.body;

  try {
    const query = `
      INSERT INTO obras (nombre, fecha_inicio, fecha_fin, estado, presupuesto_total)
      VALUES ($1, $2, $3, 'activa', $4)
      RETURNING *;
    `;
    const values = [nombre, fecha_inicio, fecha_fin, presupuesto_total];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando obra:', error);
    res.status(500).json({ error: 'Error al crear obra' });
  }
};
