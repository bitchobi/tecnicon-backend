
-- ==========================================
-- Base de datos: Control de Obra TECNICON
-- Autor: Asistente IA
-- Fecha: 2025-08-02
-- ==========================================

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrador', 'operador'))
);

-- Crear tabla de obras
CREATE TABLE obras (
    id_obra SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada'))
);

-- Crear tabla de presupuestos
CREATE TABLE presupuestos (
    id_presupuesto SERIAL PRIMARY KEY,
    id_obra INT NOT NULL REFERENCES obras(id_obra) ON DELETE CASCADE,
    id_operador INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    monto NUMERIC(12,2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('inicial', 'adicional')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de gastos
CREATE TABLE gastos (
    id_gasto SERIAL PRIMARY KEY,
    id_obra INT NOT NULL REFERENCES obras(id_obra) ON DELETE CASCADE,
    id_operador INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de imágenes de gastos
CREATE TABLE imagenes_gastos (
    id_imagen SERIAL PRIMARY KEY,
    id_gasto INT NOT NULL REFERENCES gastos(id_gasto) ON DELETE CASCADE,
    ruta_archivo VARCHAR(255) NOT NULL,
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_gastos_obra ON gastos(id_obra);
CREATE INDEX idx_gastos_operador ON gastos(id_operador);
CREATE INDEX idx_presupuestos_obra ON presupuestos(id_obra);
CREATE INDEX idx_presupuestos_operador ON presupuestos(id_operador);

-- Vista para ver presupuesto disponible por operador
CREATE VIEW vista_presupuesto_operador AS
SELECT 
    u.id_usuario AS id_operador,
    u.nombre AS operador,
    o.id_obra,
    o.nombre AS obra,
    SUM(p.monto) AS presupuesto_total,
    COALESCE(SUM(g.monto),0) AS gasto_total,
    SUM(p.monto) - COALESCE(SUM(g.monto),0) AS presupuesto_disponible
FROM usuarios u
JOIN presupuestos p ON u.id_usuario = p.id_operador
JOIN obras o ON o.id_obra = p.id_obra
LEFT JOIN gastos g ON g.id_operador = u.id_usuario AND g.id_obra = o.id_obra
GROUP BY u.id_usuario, u.nombre, o.id_obra, o.nombre;
