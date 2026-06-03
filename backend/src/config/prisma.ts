import { PrismaClient } from '@prisma/client';
import { config } from './index';

declare global {
  // Prevent multiple instances in development (hot reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ||
  new PrismaClient({
    log:
      config.env === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: config.isProduction ? 'minimal' : 'pretty',
  });

if (!config.isProduction) {
  global.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
