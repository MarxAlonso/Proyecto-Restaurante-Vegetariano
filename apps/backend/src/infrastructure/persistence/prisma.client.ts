import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton con soporte para:
 * - Hot-reload en desarrollo (globalThis cache)
 * - Pool de conexiones configurable para Neon serverless
 * - Graceful shutdown en SIGTERM/SIGINT
 *
 * Security best practice: Conexión única reutilizada en serverless
 * para evitar agotar el pool de Neon DB (ISO 25010 - Reliability)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
    // Configuración de pool para Neon serverless
    // Se controla via DATABASE_URL con ?pgbouncer=true&connection_limit=5
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

// Graceful shutdown: desconecta Prisma cuando el proceso termina
// Previene fugas de conexiones en Neon (ISO 25010 - Fault Tolerance)
const shutdown = async (signal: string) => {
  console.log(`🛑 [Prisma] Received ${signal}. Disconnecting...`);
  await prismaClient.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default prismaClient;
