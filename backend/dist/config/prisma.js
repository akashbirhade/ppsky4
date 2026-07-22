"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const index_1 = require("./index");
const prisma = global.__prisma ||
    new client_1.PrismaClient({
        log: index_1.config.env === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
        errorFormat: index_1.config.isProduction ? 'minimal' : 'pretty',
    });
if (!index_1.config.isProduction) {
    global.__prisma = prisma;
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
exports.default = prisma;
//# sourceMappingURL=prisma.js.map