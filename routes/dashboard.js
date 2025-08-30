import { Router } from 'express';
import { 
  getResumenObra,
  exportResumenObraExcel,
  exportResumenObraPDF
} from '../controllers/dashboardController.js';
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js';

const router = Router();

// 🔹 Obtener resumen de obra (JSON para dashboard)
router.get(
  '/resumen/:id_obra', 
  verificarToken, 
  verificarRol(['admin']), 
  getResumenObra
);

// 🔹 Exportar resumen de obra a Excel
router.get(
  '/resumen/:id_obra/excel', 
  verificarToken, 
  verificarRol(['admin']), 
  exportResumenObraExcel
);

// 🔹 Exportar resumen de obra a PDF
router.get(
  '/resumen/:id_obra/pdf', 
  verificarToken, 
  verificarRol(['admin']), 
  exportResumenObraPDF
);

export default router;
