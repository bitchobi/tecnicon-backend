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
  const { nombre, fecha_inicio, fecha_fin, estado = 'activa' } = req.body;

  try {
    const query = `
      INSERT INTO obras (nombre, fecha_inicio, fecha_fin, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [nombre, fecha_inicio, fecha_fin, estado];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando obra:', error);
    res.status(500).json({ error: 'Error al crear obra' });
  }
};

export const updateObra = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, estado } = req.body;

  try {
    const query = `
      UPDATE obras 
      SET nombre = $1, fecha_inicio = $2, fecha_fin = $3, estado = $4
      WHERE id_obra = $5
      RETURNING *;
    `;
    const values = [nombre, fecha_inicio, fecha_fin, estado, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando obra:', error);
    res.status(500).json({ error: 'Error al actualizar obra' });
  }
};

export const deleteObra = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la obra tiene presupuestos o gastos asociados
    const checkQuery = `
      SELECT 
        (SELECT COUNT(*) FROM presupuestos WHERE id_obra = $1) as presupuestos,
        (SELECT COUNT(*) FROM gastos WHERE id_obra = $1) as gastos
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    const { presupuestos, gastos } = checkResult.rows[0];

    if (parseInt(presupuestos) > 0 || parseInt(gastos) > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la obra. Tiene ${presupuestos} presupuestos y ${gastos} gastos asociados.`
      });
    }

    const query = 'DELETE FROM obras WHERE id_obra = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    res.json({ message: 'Obra eliminada correctamente', obra: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando obra:', error);
    res.status(500).json({ error: 'Error al eliminar obra' });
  }
};
