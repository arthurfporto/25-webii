// src/middlewares/deprecation.js

/**
 * Middleware de depreciação de API
 * Adiciona headers e avisos para versões depreciadas
 */

/**
 * Cria middleware de depreciação para uma versão específica
 * @param {Object} options - Opções de depreciação
 * @param {string} options.version - Versão depreciada (ex: 'v1')
 * @param {string} options.sunsetDate - Data de desativação (ISO 8601)
 * @param {string} options.successorVersion - Versão sucessora (ex: 'v2')
 * @param {string} options.migrationGuide - URL do guia de migração
 * @param {boolean} options.enabled - Se a depreciação está ativa
 */
export const createDeprecationMiddleware = (options = {}) => {
  const {
    version = 'v1',
    sunsetDate = null,
    successorVersion = 'v2',
    enabled = false, // Por padrão, desativado
  } = options;

  return (req, res, next) => {
    // Se depreciação não está habilitada, apenas passa adiante
    if (!enabled) {
      return next();
    }

    // Adiciona headers HTTP padrão de depreciação
    res.setHeader('Deprecation', 'true');

    if (sunsetDate) {
      res.setHeader('Sunset', new Date(sunsetDate).toUTCString());
    }

    res.setHeader('Link', `</${successorVersion}>; rel="successor-version"`);

    // Intercepta res.json para adicionar aviso no corpo
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      // Adiciona aviso de depreciação no corpo da resposta
      const responseWithWarning = {
        ...data,
        _deprecation: {
          deprecated: true,
          version: version,
          message: `API ${version} está depreciada e será descontinuada ${sunsetDate ? ` em ${new Date(sunsetDate).toLocaleDateString('pt-BR')}` : ''}.`,
          successor_version: successorVersion,
          sunset_date: sunsetDate || null,
        },
      };
      return originalJson(responseWithWarning);
    };

    next();
  };
};

/**
 * Middleware específico para depreciar v1
 * Para ativar, basta mudar enabled para true
 */
export const deprecateV1 = createDeprecationMiddleware({
  version: 'v1',
  sunsetDate: '2026-12-31T23:59:59Z', // 1 ano no futuro
  successorVersion: 'v2',
  enabled: false, // MUDAR PARA true QUANDO QUISER ATIVAR
});

export default {
  createDeprecationMiddleware,
  deprecateV1,
};
