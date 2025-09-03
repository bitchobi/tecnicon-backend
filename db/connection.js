// db/connection.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'tecnicon_user',
  host: 'localhost',
  database: 'tecnicon_control_obra', 
  password: '123456',
  port: 5432,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Error inesperado en cliente inactivo', err);
  process.exit(-1);
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
};

export { pool };
