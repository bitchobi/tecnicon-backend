// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/')); // Carpeta uploads
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp_original-name.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${uniqueSuffix}_${name}${ext}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG, PNG y PDF'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: fileFilter
});

// Middleware para múltiples archivos
export const uploadMiddleware = upload.array('imagenes', 5);

// Middleware para un solo archivo
export const uploadSingle = upload.single('imagen');

// Exportación por defecto
export default uploadMiddleware;