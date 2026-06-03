import 'dotenv/config';
import http from 'http';
import app from './app';
import { setupSocketIO } from './socket';
import { config } from '@config/index';
import prisma from '@config/prisma';
import logger from '@utils/logger';

const server = http.createServer(app);

// Initialize Socket.io with WebRTC signaling
const io = setupSocketIO(server);

// Make io accessible in the app for pushing events
(app as any).io = io;

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(async (err) => {
    if (err) logger.error('Server close error', err);

    try {
      await prisma.$disconnect();
      logger.info('Database disconnected');
    } catch (e) {
      logger.error('DB disconnect error', e);
    }

    logger.info('Graceful shutdown complete');
    process.exit(err ? 1 : 0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 30s timeout');
    process.exit(1);
  }, 30_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection', reason);
  if (config.isProduction) shutdown('UnhandledRejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception', err);
  shutdown('UncaughtException');
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    server.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════╗
║       Soulmate Sync API Server         ║
╠════════════════════════════════════════╣
║  Port:   ${config.port}                           ║
║  Env:    ${config.env}                    ║
║  Docs:   http://localhost:${config.port}/api-docs ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

export { io };
