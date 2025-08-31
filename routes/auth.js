// routes/auth.js
import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/login
router.post('/login', login);

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

// GET /auth/verify - Verificar si el token es válido
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Token requerido' });
    }

    const token = authHeader.substring(7);
    const jwt = await import('jsonwebtoken');
    
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    // Verificar usuario existe
    const { pool } = await import('../db/connection.js');
    const result = await pool.query('SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = $1', [decoded.id_usuario]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ valid: false, error: 'Usuario no existe' });
    }

    res.json({ 
      valid: true, 
      user: result.rows[0] 
    });

  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
});

export default router;