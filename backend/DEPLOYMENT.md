# Soulmate Sync — Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment (AWS/GCP)](#cloud-deployment)
7. [Scaling for 1 Million Users](#scaling)
8. [Monitoring & Logging](#monitoring)
9. [Security Checklist](#security)

---

## 1. Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- A Cloudinary account (for photo uploads)
- A Twilio account (for SMS OTP)

---

## 2. Local Development Setup

```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env with your actual values

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed database (200 profiles)
npm run db:seed

# Start development server
npm run dev
```

Server starts at: `http://localhost:5000`
API Docs (Swagger): `http://localhost:5000/api-docs`

---

## 3. Database Setup

### PostgreSQL Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE soulmate_sync;"
sudo -u postgres psql -c "CREATE USER matrimony_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE soulmate_sync TO matrimony_user;"
```

### Redis Installation
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

### Run Prisma Migrations
```bash
npx prisma migrate deploy
```

---

## 4. Environment Configuration

Copy `.env.example` to `.env` and fill in all values.

### Critical Settings:
```env
NODE_ENV=production
PORT=5000

# Strong secrets (generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET=<64_char_random>
JWT_REFRESH_SECRET=<64_char_random>

# Production database
DATABASE_URL="postgresql://user:pass@db-host:5432/soulmate_sync?schema=public&connection_limit=10"

# Redis (for session/cache in future)
REDIS_URL="redis://redis-host:6379"

# Cloudinary (photo storage)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 5. Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/soulmate_sync
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soulmate_sync
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### Build & Run
```bash
docker-compose build
docker-compose up -d
docker-compose logs -f app
```

---

## 6. Cloud Deployment (AWS)

### Architecture Overview
```
Internet → Route53 → CloudFront → ALB → ECS Fargate (App)
                                      ↓
                                 RDS PostgreSQL (Multi-AZ)
                                      ↓
                                 ElastiCache Redis
```

### AWS ECS Deployment Steps:

1. **ECR: Push Docker image**
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.ap-south-1.amazonaws.com
docker build -t soulmate-sync-backend .
docker tag soulmate-sync-backend:latest <account_id>.dkr.ecr.ap-south-1.amazonaws.com/soulmate-sync-backend:latest
docker push <account_id>.dkr.ecr.ap-south-1.amazonaws.com/soulmate-sync-backend:latest
```

2. **RDS: Create PostgreSQL instance**
   - Engine: PostgreSQL 15
   - Instance: db.t3.medium (or db.r5.large for production)
   - Multi-AZ: Yes (for HA)
   - Storage: 100GB GP3 SSD

3. **ElastiCache: Create Redis cluster**
   - Engine: Redis 7
   - Node type: cache.t3.micro

4. **ECS: Create Fargate service**
   - Task definition with environment variables from Secrets Manager
   - Min: 2 tasks, Max: 20 tasks for auto-scaling
   - CPU: 1 vCPU, Memory: 2 GB

5. **ALB: Configure Application Load Balancer**
   - Health check: `GET /health`
   - SSL termination with ACM certificate
   - WebSocket upgrade headers for Socket.io

### Nginx Configuration for WebSockets
```nginx
upstream backend {
  server app:5000;
  keepalive 64;
}

server {
  listen 80;
  server_name api.soulmatesync.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.soulmatesync.com;

  ssl_certificate /etc/nginx/ssl/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  client_max_body_size 10M;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";  # Required for WebSocket
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400s;
  }
}
```

---

## 7. Scaling for 1 Million Users

### Database Optimization
```sql
-- Partitioning messages table by month (reduces table size)
CREATE TABLE messages_y2024m01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Connection pooling with PgBouncer
-- max_client_conn = 1000
-- default_pool_size = 25

-- Read replicas for heavy read queries
-- Route: GET /matches/* → Read Replica
-- Route: POST/PUT/DELETE → Primary
```

### Horizontal Scaling with Redis (Socket.io)
```typescript
// server.ts — Add Redis adapter for multi-instance Socket.io
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

### Caching Strategy
- **Profile data**: Redis TTL 5 minutes
- **Match discovery**: Redis TTL 10 minutes
- **Authentication**: Redis for token blacklist
- **Rate limiting**: Redis sliding window

### CDN for Photos
- Upload to Cloudinary → Automatic CDN globally
- Use `f_auto,q_auto` Cloudinary transforms for format optimization
- Lazy loading on frontend

### Load Testing
```bash
# Install k6
brew install k6

# Load test 1000 concurrent users
k6 run --vus 1000 --duration 60s load-test.js
```

---

## 8. Monitoring & Logging

### Application Logs
```bash
# View logs (Docker)
docker-compose logs -f app

# Logs are saved to ./logs/ with daily rotation
ls -la logs/
```

### Health Check Endpoints
```
GET /health          → Service health
GET /api/v1/admin/dashboard  → Admin metrics (authenticated)
```

### Recommended Monitoring Stack
- **Logs**: AWS CloudWatch / ELK Stack (Elasticsearch + Logstash + Kibana)
- **Metrics**: Prometheus + Grafana
- **APM**: Datadog or New Relic
- **Alerts**: PagerDuty for critical issues

### Key Metrics to Monitor
| Metric | Alert Threshold |
|--------|----------------|
| API Response Time | > 500ms p95 |
| Database Query Time | > 100ms |
| Error Rate | > 1% |
| CPU Usage | > 80% |
| Memory Usage | > 85% |
| Active WebSocket Connections | > 10,000 |

---

## 9. Security Checklist

### Production Security Requirements

- [x] HTTPS enforced (HTTP → HTTPS redirect)
- [x] JWT tokens with short expiry (15 min access, 30 day refresh)
- [x] JWT refresh token rotation on every use
- [x] bcrypt password hashing (12 rounds)
- [x] Rate limiting on all endpoints
- [x] Strict rate limiting on auth endpoints (10 req/15 min)
- [x] Helmet.js security headers
- [x] CORS restricted to known origins
- [x] Input validation with Zod on all endpoints
- [x] SQL injection prevention via Prisma ORM
- [x] Parameterized queries only
- [x] HTTP-only cookies for refresh tokens
- [x] Audit logs for admin actions
- [x] Soft delete (no hard deletes)
- [ ] Enable AWS WAF
- [ ] Enable DDoS protection (AWS Shield)
- [ ] Set up fail2ban for repeated failed logins
- [ ] Database encryption at rest
- [ ] Enable VPC with private subnets for DB

### Environment Security
```bash
# Rotate JWT secrets every 90 days
# Never commit .env to git
# Use AWS Secrets Manager or Vault for production secrets

# Example: Read secret from AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/soulmate-sync/jwt
```

---

## Quick Start Commands Reference

```bash
npm run dev             # Start development server
npm run build           # Compile TypeScript
npm run start           # Start production server
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations (production)
npm run db:push         # Sync schema (development only)
npm run db:seed         # Seed 200 test profiles
npm run db:studio       # Open Prisma Studio GUI
npm run db:reset        # Reset database (development only!)
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/soulmate-sync
- Documentation: https://docs.soulmatesync.com
