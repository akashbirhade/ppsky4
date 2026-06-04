import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import { config } from '@config/index';
import { generalRateLimit } from '@middleware/rateLimit.middleware';
import { errorHandler, notFound } from '@middleware/error.middleware';
import logger from '@utils/logger';

// Routes
import authRoutes from '@routes/auth.routes';
import profileRoutes from '@routes/profile.routes';
import matchRoutes from '@routes/match.routes';
import chatRoutes from '@routes/chat.routes';
import callRoutes from '@routes/call.routes';
import adminRoutes from '@routes/admin.routes';
import hostRoutes from '@routes/host.routes';

// Notification routes inline
import { NotificationService } from '@services/notification.service';
import { authenticate } from '@middleware/auth.middleware';

const notificationService = new NotificationService();

const app = express();

// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── COMPRESSION ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.security.cookieSecret));

// ─── LOGGING ─────────────────────────────────────────────────────────────────
app.use(
  morgan(config.isProduction ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
app.use(generalRateLimit);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── SWAGGER DOCS ────────────────────────────────────────────────────────────
try {
  const swaggerDoc = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      customSiteTitle: 'Soulmate Sync API',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
} catch {
  logger.warn('swagger.yaml not found — API docs disabled');
}

// ─── API ROUTES ──────────────────────────────────────────────────────────────
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/profiles`, profileRoutes);
app.use(`${apiPrefix}/matches`, matchRoutes);
app.use(`${apiPrefix}/chats`, chatRoutes);
app.use(`${apiPrefix}/calls`, callRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/hosts`, hostRoutes);

// Notification routes
app.use(`${apiPrefix}/notifications`, authenticate, (async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await notificationService.getNotifications(req.user!.userId, page, limit);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}) as express.RequestHandler);

app.put(`${apiPrefix}/notifications/read-all`, authenticate, (async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}) as express.RequestHandler);

// ─── 404 & ERROR HANDLERS ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
