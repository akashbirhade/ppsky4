"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const yamljs_1 = __importDefault(require("yamljs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const index_1 = require("@config/index");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const error_middleware_1 = require("@middleware/error.middleware");
const logger_1 = __importDefault(require("@utils/logger"));
// Routes
const auth_routes_1 = __importDefault(require("@routes/auth.routes"));
const profile_routes_1 = __importDefault(require("@routes/profile.routes"));
const match_routes_1 = __importDefault(require("@routes/match.routes"));
const chat_routes_1 = __importDefault(require("@routes/chat.routes"));
const call_routes_1 = __importDefault(require("@routes/call.routes"));
const admin_routes_1 = __importDefault(require("@routes/admin.routes"));
const host_routes_1 = __importDefault(require("@routes/host.routes"));
const kundali_routes_1 = __importDefault(require("@routes/kundali.routes"));
const ai_routes_1 = __importDefault(require("@routes/ai.routes"));
const verification_routes_1 = __importDefault(require("@routes/verification.routes"));
const masterdata_routes_1 = __importDefault(require("@routes/masterdata.routes"));
// Notification routes inline
const notification_service_1 = require("@services/notification.service");
const auth_middleware_1 = require("@middleware/auth.middleware");
const notificationService = new notification_service_1.NotificationService();
const app = (0, express_1.default)();
// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: index_1.config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
// ─── CORS ────────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || index_1.config.cors.allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// ─── COMPRESSION ─────────────────────────────────────────────────────────────
app.use((0, compression_1.default)());
// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(index_1.config.security.cookieSecret));
// ─── LOGGING ─────────────────────────────────────────────────────────────────
app.use((0, morgan_1.default)(index_1.config.isProduction ? 'combined' : 'dev', {
    stream: { write: (msg) => logger_1.default.http(msg.trim()) },
    skip: (req) => req.url === '/health',
}));
// ─── RATE LIMITING ───────────────────────────────────────────────────────────
app.use(rateLimit_middleware_1.generalRateLimit);
// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
// ─── STATIC UPLOADS ──────────────────────────────────────────────────────────
// Serves locally-stored profile photos (used when Cloudinary is not configured).
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    fallthrough: true,
}));
// ─── SWAGGER DOCS ────────────────────────────────────────────────────────────
try {
    const swaggerDoc = yamljs_1.default.load(path_1.default.join(__dirname, '..', 'swagger.yaml'));
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc, {
        customSiteTitle: 'Soulmate Sync API',
        customCss: '.swagger-ui .topbar { display: none }',
    }));
}
catch {
    logger_1.default.warn('swagger.yaml not found — API docs disabled');
}
// ─── API ROUTES ──────────────────────────────────────────────────────────────
const apiPrefix = `/api/${index_1.config.apiVersion}`;
app.use(`${apiPrefix}/auth`, auth_routes_1.default);
app.use(`${apiPrefix}/profiles`, profile_routes_1.default);
app.use(`${apiPrefix}/matches`, match_routes_1.default);
app.use(`${apiPrefix}/chats`, chat_routes_1.default);
app.use(`${apiPrefix}/calls`, call_routes_1.default);
app.use(`${apiPrefix}/admin`, admin_routes_1.default);
app.use(`${apiPrefix}/hosts`, host_routes_1.default);
app.use(`${apiPrefix}/kundali`, kundali_routes_1.default);
app.use(`${apiPrefix}/ai`, ai_routes_1.default);
app.use(`${apiPrefix}/verification`, verification_routes_1.default);
app.use(`${apiPrefix}/masterdata`, masterdata_routes_1.default);
// Notification routes
app.use(`${apiPrefix}/notifications`, auth_middleware_1.authenticate, (async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await notificationService.getNotifications(req.user.userId, page, limit);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}));
app.put(`${apiPrefix}/notifications/read-all`, auth_middleware_1.authenticate, (async (req, res, next) => {
    try {
        await notificationService.markAllRead(req.user.userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (err) {
        next(err);
    }
}));
// ─── 404 & ERROR HANDLERS ────────────────────────────────────────────────────
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map