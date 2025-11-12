// src/services/uploadService.js
import { UploadClient } from '@uploadcare/upload-client';
import { ValidationError } from '../../../errors/AppError.js';

/**
 * Upload Service
 * Responsável por fazer upload de arquivos para o Uploadcare
 */

// Inicializa o cliente do Uploadcare com a chave pública
const client = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

/**
 * Faz upload de um arquivo para o Uploadcare
 * @param {Buffer} fileBuffer - Buffer do arquivo (vem do Multer)
 * @param {string} fileName - Nome original do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo (ex: 'image/jpeg')
 * @returns {Promise<string>} URL do arquivo no CDN do Uploadcare
 * @throws {ValidationError} Se upload falhar
 */
export const uploadToUploadcare = async (fileBuffer, fileName, mimeType) => {
  try {
    // Validações básicas
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new ValidationError('Arquivo vazio ou inválido');
    }

    if (!process.env.UPLOADCARE_PUBLIC_KEY) {
      throw new Error(
        'UPLOADCARE_PUBLIC_KEY não configurada nas variáveis de ambiente',
      );
    }

    console.log('📤 Iniciando upload para Uploadcare:', {
      fileName,
      mimeType,
      size: `${(fileBuffer.length / 1024).toFixed(2)} KB`,
    });

    // Faz o upload do buffer para o Uploadcare
    const file = await client.uploadFile(fileBuffer, {
      fileName: fileName,
      contentType: mimeType,
      //   store: 'auto', // Armazena automaticamente no Uploadcare Storage
      store: 'true',
    });

    // Constrói a URL do CDN
    const cdnUrl = `https://ucarecdn.com/${file.uuid}/`;

    console.log('✅ Upload concluído com sucesso:', cdnUrl);

    return cdnUrl;
  } catch (error) {
    console.error('❌ Erro no upload para Uploadcare:', error);

    // Lança erro customizado
    throw new ValidationError(`Falha no upload da imagem: ${error.message}`, [
      { field: 'foto', message: error.message },
    ]);
  }
};

/**
 * Deleta um arquivo do Uploadcare (para cleanup em caso de erro)
 * @param {string} fileId - UUID do arquivo no Uploadcare
 * @returns {Promise<boolean>} True se deletado com sucesso
 */
export const deleteFromUploadcare = async fileId => {
  try {
    // Nota: Deleção requer a Secret Key e uso da REST API
    // Por simplicidade, não implementaremos agora
    // Em produção, você usaria a REST API com autenticação
    console.log('⚠️  Deleção de arquivo não implementada:', fileId);
    return false;
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    return false;
  }
};

export default {
  uploadToUploadcare,
  deleteFromUploadcare,
};
