"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket");
const index_1 = require("@config/index");
const prisma_1 = __importDefault(require("@config/prisma"));
const logger_1 = __importDefault(require("@utils/logger"));
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io with WebRTC signaling
const io = (0, socket_1.setupSocketIO)(server);
exports.io = io;
// Make io accessible in the app for pushing events
app_1.default.io = io;
// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────────────────────
const shutdown = async (signal) => {
    logger_1.default.info(`${signal} received — starting graceful shutdown`);
    server.close(async (err) => {
        if (err)
            logger_1.default.error('Server close error', err);
        try {
            await prisma_1.default.$disconnect();
            logger_1.default.info('Database disconnected');
        }
        catch (e) {
            logger_1.default.error('DB disconnect error', e);
        }
        logger_1.default.info('Graceful shutdown complete');
        process.exit(err ? 1 : 0);
    });
    // Force exit after 30 seconds
    setTimeout(() => {
        logger_1.default.error('Forced shutdown after 30s timeout');
        process.exit(1);
    }, 30000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Promise Rejection', reason);
    if (index_1.config.isProduction)
        shutdown('UnhandledRejection');
});
process.on('uncaughtException', (err) => {
    logger_1.default.error('Uncaught Exception', err);
    shutdown('UncaughtException');
});
// ─── START SERVER ─────────────────────────────────────────────────────────────
const start = async () => {
    try {
        // Test DB connection
        await prisma_1.default.$connect();
        logger_1.default.info('Database connected successfully');
        server.listen(index_1.config.port, () => {
            logger_1.default.info(`
╔════════════════════════════════════════╗
║       Soulmate Sync API Server         ║
╠════════════════════════════════════════╣
║  Port:   ${index_1.config.port}                           ║
║  Env:    ${index_1.config.env}                    ║
║  Docs:   http://localhost:${index_1.config.port}/api-docs ║
╚════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map