// src/config/multer.js
import multer from 'multer';

/**
 * Configuração do Multer para Upload de Arquivos
 *
 * Strategy: Memory Storage
 * - Arquivos ficam em memória (Buffer)
 * - Não salvamos no disco do servidor
 * - Ideal para envio direto a serviços externos (Uploadcare)
 */

// Configuração de storage (memória)
const storage = multer.memoryStorage();

// Validação de arquivos
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Arquivo válido
    cb(null, true);
  } else {
    // Arquivo inválido
    cb(
      new Error(
        `Tipo de arquivo não permitido: ${file.mimetype}. Use: JPG, PNG, GIF ou WebP`,
      ),
      false,
    );
  }
};

// Configuração completa do Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB em bytes
  },
  fileFilter: fileFilter,
});

export default upload;
