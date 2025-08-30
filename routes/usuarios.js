// routes/usuarios.js
import { Router } from 'express';
import { listarOperadores } from '../controllers/usuariosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/operadores', verificarToken, listarOperadores);

export default router;
