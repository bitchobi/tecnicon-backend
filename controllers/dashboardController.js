import { pool } from '../db/connection.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// 🟢 Obtener resumen de obra (JSON para dashboard)
export const getResumenObra = async (req, res) => {
  const { id_obra } = req.params;

  try {
    const query = `
      SELECT 
          u.id_usuario AS id_operador,
          u.nombre AS operador,
          COALESCE(SUM(p.monto), 0) AS presupuesto_total,
          COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) AS total_gastado,
          CASE 
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 0
              ELSE ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              )
          END AS porcentaje_consumido,
          CASE
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 'gris'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 40 THEN 'verde'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 70 THEN 'amarillo'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 90 THEN 'naranja'
              ELSE 'rojo'
          END AS color_semaforo
      FROM usuarios u
      LEFT JOIN presupuestos p 
          ON p.id_operador = u.id_usuario AND p.id_obra = $1
      LEFT JOIN (
          SELECT id_operador, id_obra, SUM(monto) AS total_gastado
          FROM gastos
          WHERE id_obra = $1
          GROUP BY id_operador, id_obra
      ) g_suma
          ON g_suma.id_operador = u.id_usuario
      WHERE EXISTS (
          SELECT 1 FROM presupuestos pr 
          WHERE pr.id_operador = u.id_usuario AND pr.id_obra = $1
      )
      GROUP BY u.id_usuario, u.nombre
      ORDER BY porcentaje_consumido DESC;
    `;

    const result = await pool.query(query, [id_obra]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo resumen de obra:', error);
    res.status(500).json({ error: 'Error al obtener el resumen' });
  }
};

// 🟢 Exportar resumen de obra a Excel
export const exportResumenObraExcel = async (req, res) => {
  const { id_obra } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
          u.id_usuario AS id_operador,
          u.nombre AS operador,
          COALESCE(SUM(p.monto), 0) AS presupuesto_total,
          COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) AS total_gastado,
          CASE 
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 0
              ELSE ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              )
          END AS porcentaje_consumido,
          CASE
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 'gris'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 40 THEN 'verde'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 70 THEN 'amarillo'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 90 THEN 'naranja'
              ELSE 'rojo'
          END AS color_semaforo
      FROM usuarios u
      LEFT JOIN presupuestos p 
          ON p.id_operador = u.id_usuario AND p.id_obra = $1
      LEFT JOIN (
          SELECT id_operador, id_obra, SUM(monto) AS total_gastado
          FROM gastos
          WHERE id_obra = $1
          GROUP BY id_operador, id_obra
      ) g_suma
          ON g_suma.id_operador = u.id_usuario
      WHERE EXISTS (
          SELECT 1 FROM presupuestos pr 
          WHERE pr.id_operador = u.id_usuario AND pr.id_obra = $1
      )
      GROUP BY u.id_usuario, u.nombre
      ORDER BY porcentaje_consumido DESC;
    `, [id_obra]);

    const data = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen Obra');

    worksheet.columns = [
      { header: 'ID Operador', key: 'id_operador', width: 15 },
      { header: 'Operador', key: 'operador', width: 30 },
      { header: 'Presupuesto Total', key: 'presupuesto_total', width: 20 },
      { header: 'Total Gastado', key: 'total_gastado', width: 20 },
      { header: 'Porcentaje Consumido (%)', key: 'porcentaje_consumido', width: 25 },
      { header: 'Color Semáforo', key: 'color_semaforo', width: 20 },
    ];

    data.forEach(row => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    res.setHeader('Content-Disposition', `attachment; filename=resumen_obra_${id_obra}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// 🟢 Exportar resumen de obra a PDF
export const exportResumenObraPDF = async (req, res) => {
  const { id_obra } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
          u.id_usuario AS id_operador,
          u.nombre AS operador,
          COALESCE(SUM(p.monto), 0) AS presupuesto_total,
          COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) AS total_gastado,
          CASE 
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 0
              ELSE ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              )
          END AS porcentaje_consumido,
          CASE
              WHEN COALESCE(SUM(p.monto),0) = 0 THEN 'gris'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 40 THEN 'verde'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 70 THEN 'amarillo'
              WHEN ROUND(
                  COALESCE(SUM(DISTINCT g_suma.total_gastado), 0) 
                  / COALESCE(SUM(p.monto), 0) * 100, 2
              ) <= 90 THEN 'naranja'
              ELSE 'rojo'
          END AS color_semaforo
      FROM usuarios u
      LEFT JOIN presupuestos p 
          ON p.id_operador = u.id_usuario AND p.id_obra = $1
      LEFT JOIN (
          SELECT id_operador, id_obra, SUM(monto) AS total_gastado
          FROM gastos
          WHERE id_obra = $1
          GROUP BY id_operador, id_obra
      ) g_suma
          ON g_suma.id_operador = u.id_usuario
      WHERE EXISTS (
          SELECT 1 FROM presupuestos pr 
          WHERE pr.id_operador = u.id_usuario AND pr.id_obra = $1
      )
      GROUP BY u.id_usuario, u.nombre
      ORDER BY porcentaje_consumido DESC;
    `, [id_obra]);

    const data = result.rows;

    res.setHeader('Content-Disposition', `attachment; filename=resumen_obra_${id_obra}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(18).text(`Resumen de Obra ${id_obra}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('ID Operador | Operador           | Presupuesto | Gastado | % | Semáforo');
    doc.moveDown(0.5);

    doc.font('Helvetica');
    data.forEach(row => {
      doc.text(
        `${row.id_operador.toString().padEnd(11)} | ` +
        `${row.operador.padEnd(18)} | ` +
        `${row.presupuesto_total.toString().padEnd(10)} | ` +
        `${row.total_gastado.toString().padEnd(7)} | ` +
        `${row.porcentaje_consumido.toString().padEnd(5)} | ` +
        `${row.color_semaforo}`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};
