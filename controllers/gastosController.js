import { pool } from '../db/connection.js';

// (mantén aquí tus getGastos y addGasto tal como ya los tienes)

export const getGastos = async (req, res) => {
  const { id_obra } = req.params;

  try {
    const query = `
      SELECT 
        g.id_gasto,
        g.id_obra,
        g.id_operador,
        g.fecha,
        g.monto,
        g.descripcion,
        g.categoria,
        COALESCE(
          json_agg(
            json_build_object(
              'id_imagen', i.id_imagen,
              'ruta_archivo', i.ruta_archivo,
              'subido_en', i.subido_en
            )
          ) FILTER (WHERE i.id_imagen IS NOT NULL),
          '[]'
        ) AS imagenes
      FROM gastos g
      LEFT JOIN imagenes_gastos i ON g.id_gasto = i.id_gasto
      WHERE g.id_obra = $1
      GROUP BY g.id_gasto
      ORDER BY g.fecha DESC;
    `;

    const result = await pool.query(query, [id_obra]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

export const addGasto = async (req, res) => {
  const { id_obra, fecha, monto, descripcion, categoria } = req.body;
  const id_operador = req.user?.id_usuario;   // ✅ viene del JWT
  const archivos = req.files || [];

  // Validación
  if (!id_obra || !id_operador || !fecha || !monto) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // 1) Insertar gasto
    const insertGasto = `
      INSERT INTO gastos (id_obra, id_operador, fecha, monto, descripcion, categoria)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const resultGasto = await pool.query(insertGasto, [
      id_obra, id_operador, fecha, monto, descripcion, categoria
    ]);
    const gasto = resultGasto.rows[0];

    // 2) Guardar imágenes (si hay)
    const imagenes = [];
    for (const file of archivos) {
      const insertImg = `
        INSERT INTO imagenes_gastos (id_gasto, ruta_archivo)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const imgResult = await pool.query(insertImg, [gasto.id_gasto, file.path]);
      imagenes.push(imgResult.rows[0]);
    }

    // 3) Respuesta
    res.status(201).json({
      mensaje: 'Gasto registrado con imágenes',
      gasto: { ...gasto, imagenes }
    });
  } catch (error) {
    console.error('Error registrando gasto:', error);
    res.status(500).json({ error: 'Error al registrar gasto' });
  }
};
export const getGastosAll = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id_gasto,
        g.id_obra,
        o.nombre      AS obra_nombre,
        g.id_operador,
        u.nombre      AS operador_nombre,
        g.fecha,
        g.monto,
        g.descripcion,
        g.categoria,
        COALESCE(
          json_agg(
            json_build_object(
              'id_imagen', i.id_imagen,
              'ruta_archivo', i.ruta_archivo,
              'subido_en', i.subido_en
            )
          ) FILTER (WHERE i.id_imagen IS NOT NULL),
          '[]'
        ) AS imagenes
      FROM gastos g
      LEFT JOIN obras o           ON o.id_obra = g.id_obra
      LEFT JOIN usuarios u        ON u.id_usuario = g.id_operador
      LEFT JOIN imagenes_gastos i ON i.id_gasto = g.id_gasto
      GROUP BY g.id_gasto, o.nombre, u.nombre
      ORDER BY g.fecha DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo todos los gastos:', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

