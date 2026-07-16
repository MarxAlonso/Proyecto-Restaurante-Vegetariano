/**
 * Logger estructurado para la aplicación.
 *
 * Security best practice: Logging estructurado con niveles permite:
 * - Diferenciar debug de producción (no exponer datos internos)
 * - Trazabilidad de errores sin leak de información sensible
 * - Rotación de logs para gestión de almacenamiento
 *
 * ISO 25010 - Maintainability (Analyzability)
 */

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

// En tests, silenciar logs para no contaminar la salida
const logger = pino({
  level: isTest ? 'silent' : (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.credential',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Crea un logger hijoleado para un módulo específico.
 * Ejemplo: const log = getModuleLogger('AuthService');
 */
export function getModuleLogger(module: string) {
  return logger.child({ module });
}

export default logger;
