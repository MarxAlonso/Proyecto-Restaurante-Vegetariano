/**
 * Esquemas de validación Zod para el módulo de autenticación.
 *
 * Security best practice: Validar toda entrada de usuario en el borde
 * de la API antes de procesarla. TypeScript no valida en runtime.
 *
 * ISO 25010 - Functional Correctness, Security - Accountability
 */

import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email es requerido' })
    .email('Email inválido')
    .max(255, 'Email demasiado largo'),
  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña demasiado larga'),
  name: z
    .string({ required_error: 'Nombre es requerido' })
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'Nombre solo debe contener letras'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email es requerido' })
    .email('Email inválido'),
  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(1, 'Contraseña es requerida'),
});

export const googleLoginSchema = z.object({
  credential: z
    .string({ required_error: 'Credencial de Google es requerida' })
    .min(1, 'Credencial inválida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
