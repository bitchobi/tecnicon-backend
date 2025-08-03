import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './db/connection.js';
import authRoutes from './routes/auth.js';
import obrasRoutes from './routes/obras.js';
import presupuestosRoutes from './routes/presupuestos.js';
import gastosRoutes from './routes/gastos.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/obras', obrasRoutes);
app.use('/presupuestos', presupuestosRoutes);
app.use('/gastos', gastosRoutes);
// Rutas base
app.get('/', (req, res) => {
  res.send('🚀 API Control de Obra TECNICON funcionando correctamente');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
