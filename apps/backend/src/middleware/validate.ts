/**
 * Middleware de validación con Zod.
 *
 * Security best practice: Validar y sanitizar toda entrada de usuario
 * en el middleware antes de que llegue a los controladores.
 * Previene mass assignment, type confusion, y malformed input.
 *
 * ISO 25010 - Functional Correctness, Security
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../infrastructure/logger';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Valida una parte específica del request contra un esquema Zod.
 * Si falla, retorna 400 con todos los errores de validación.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      // Reemplazar con datos validados/sanitizados
      (req as any)[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(
          { errors: error.errors, path: req.path, target },
          'Validation failed',
        );
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
