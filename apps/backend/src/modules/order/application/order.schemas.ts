/**
 * Esquemas de validación Zod para el módulo de órdenes.
 *
 * Security best practice: Validar estructura y tipos de datos
 * en el borde de la API antes de procesar la orden.
 *
 * ISO 25010 - Functional Correctness, Security
 */

import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string().uuid('ID de item inválido').optional(),
  menuItemId: z.string().uuid('ID de menú inválido').optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  quantity: z
    .number({ required_error: 'Cantidad es requerida' })
    .int('Cantidad debe ser un entero')
    .min(1, 'Cantidad mínima es 1')
    .max(100, 'Cantidad máxima es 100'),
  price: z
    .number({ required_error: 'Precio es requerido' })
    .positive('Precio debe ser positivo')
    .max(99999.99, 'Precio demasiado alto'),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema, { required_error: 'Items son requeridos' })
    .min(1, 'Debe haber al menos 1 item'),
  notes: z.string().max(500, 'Notas demasiado largas').optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY']).default('DINE_IN'),
  tableId: z.string().uuid('ID de mesa inválido').optional().nullable(),
  customerName: z.string().max(100).optional().nullable(),
  customerEmail: z.string().email('Email inválido').max(255).optional().nullable(),
  customerPhone: z.string().max(20).optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z
    .string({ required_error: 'Estado es requerido' })
    .min(1, 'Estado no puede estar vacío'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
