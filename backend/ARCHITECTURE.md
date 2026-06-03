# Soulmate Sync — System Architecture

## Overview

Soulmate Sync is a production-grade matrimony application built for scale. This document covers the complete technical architecture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Material UI |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 15 (Primary + Read Replica) |
| **ORM** | Prisma 5 |
| **Cache** | Redis 7 |
| **Real-Time** | Socket.io 4 |
| **Video Calling** | WebRTC + Socket.io signaling |
| **File Storage** | Cloudinary (CDN-backed) |
| **Auth** | JWT (access + refresh) + HTTP-only cookies |
| **API Docs** | Swagger/OpenAPI 3.0 |
| **Deployment** | Docker → AWS ECS Fargate |
| **Monitoring** | CloudWatch + Grafana |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js Web │  │  Mobile PWA  │  │  Admin Panel │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │    HTTPS + WSS  │                 │
┌─────────▼─────────────────▼─────────────────▼───────────────┐
│                     CDN / NGINX / ALB                        │
│              (SSL Termination + Load Balancing)              │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    EXPRESS.JS API SERVER                     │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  REST APIs  │  │ Socket.io  │  │ WebRTC     │            │
│  │  /api/v1/*  │  │ Real-Time  │  │ Signaling  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  Auth → Profile → Match → Chat → Call → Admin               │
└──────────┬───────────────────────────┬──────────────────────┘
           │                           │
   ┌───────▼───────┐          ┌────────▼────────┐
   │  PostgreSQL   │          │     Redis        │
   │  (Primary)    │          │   (Cache +       │
   │               │          │   Socket Adapter)│
   │  Read Replica │          └─────────────────┘
   └───────────────┘
           │
   ┌───────▼───────┐
   │  Cloudinary   │
   │  (Photo CDN)  │
   └───────────────┘
```

---

## Database Schema Overview

### Core Tables

```
users (authentication + account management)
  └── profiles (personal/professional/location data)
      └── photos (up to 10 photos per user)
      └── preferences (partner search criteria)
      └── subscriptions (plan + feature flags)

likes (who liked whom + match detection)
super_likes (premium express interest)
profile_views (who viewed whom)
favorites (saved profiles)
blocks (blocked users list)

conversations (chat threads between 2 users)
  └── messages (text/image/voice/video)
      └── attachments (media metadata)

calls (audio/video call records with WebRTC room ID)
reports (user reports for moderation)
notifications (in-app push notifications)
otp_verifications (email/mobile OTP)
refresh_tokens (JWT rotation with revocation)
admin_users (admin panel access)
audit_logs (admin action history)
daily_stats (analytics snapshots)
```

### Key Indexes

```sql
-- Religion + Caste (composite — rarely changes, heavily filtered)
CREATE INDEX idx_profiles_religion_caste ON profiles(religion, caste);

-- Geospatial (for Near Me feature)
CREATE INDEX idx_profiles_lat_lng ON profiles(latitude, longitude);

-- Recent activity (for Recently Active feed)
CREATE INDEX idx_users_last_active ON users(last_active DESC);

-- Conversation lookup
CREATE UNIQUE INDEX idx_conv_users ON conversations(user1_id, user2_id);

-- Message pagination
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at DESC);
```

---

## API Architecture

### REST API Endpoints

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login
POST   /api/v1/auth/logout            Logout
POST   /api/v1/auth/refresh-token     Refresh access token
POST   /api/v1/auth/verify-email      Verify email OTP
POST   /api/v1/auth/forgot-password   Send reset link
POST   /api/v1/auth/reset-password    Reset password

GET    /api/v1/profiles/me            Get my profile
PUT    /api/v1/profiles/me            Update my profile
POST   /api/v1/profiles/photos        Upload photo
GET    /api/v1/profiles/search        Full-text search
GET    /api/v1/profiles/:id           View a profile (records view)
GET    /api/v1/profiles/preferences   Get my partner preferences
PUT    /api/v1/profiles/preferences   Update preferences
GET    /api/v1/profiles/views         See who viewed my profile

GET    /api/v1/matches/new            New profiles
GET    /api/v1/matches/recently-active Active recently
GET    /api/v1/matches/near-me        Distance-based (Haversine)
GET    /api/v1/matches/most-viewed    Popular profiles
GET    /api/v1/matches/most-liked     Highly liked profiles
GET    /api/v1/matches/premium        Premium members
GET    /api/v1/matches/verified       Verified profiles
GET    /api/v1/matches/recommended    ML-scored recommendations
POST   /api/v1/matches/like/:id       Like a profile
DELETE /api/v1/matches/like/:id       Unlike
POST   /api/v1/matches/superlike/:id  Super like
POST   /api/v1/matches/favorite/:id   Add to favorites
POST   /api/v1/matches/block/:id      Block user
GET    /api/v1/matches/likes/received See who liked me [premium]
GET    /api/v1/matches/compatibility/:id Compatibility score

GET    /api/v1/chats                  List conversations
POST   /api/v1/chats/:userId/conversation Open/get conversation
GET    /api/v1/chats/:id/messages     Get messages (paginated)
POST   /api/v1/chats/:id/messages     Send message
DELETE /api/v1/chats/:id/messages/:msgId Delete message

POST   /api/v1/calls                  Initiate call
PUT    /api/v1/calls/:id/answer       Answer call
PUT    /api/v1/calls/:id/end          End call
GET    /api/v1/calls/history          Call history
GET    /api/v1/calls/missed           Missed calls

GET    /api/v1/notifications          Get notifications
PUT    /api/v1/notifications/read-all Mark all read

GET    /api/v1/admin/dashboard        Admin stats
GET    /api/v1/admin/users            User management
PUT    /api/v1/admin/users/:id/status Ban/suspend/activate
GET    /api/v1/admin/reports          Moderation queue
PUT    /api/v1/admin/reports/:id      Review report
GET    /api/v1/admin/verifications    Verification queue
PUT    /api/v1/admin/verifications/:id Approve/reject
GET    /api/v1/admin/analytics        Usage analytics
```

---

## Real-Time Architecture (Socket.io)

### Event Flow

```
CLIENT                          SERVER
  │                               │
  ├── connect (JWT in header) ───►│ Authenticate middleware
  │◄── connected ─────────────────┤ Join user:userId room
  │                               │
  ├── chat:join(convId) ─────────►│ Join conversation:convId room
  ├── chat:message(msg) ─────────►│ Save to DB
  │                               │ io.to(conversation:convId).emit(chat:message)
  │◄── chat:message ──────────────┤ All participants receive
  │                               │
  ├── typing:start ──────────────►│ socket.to(conv).emit(typing:start)
  ├── typing:stop ───────────────►│ socket.to(conv).emit(typing:stop)
  │                               │
  ├── chat:read(msgIds) ─────────►│ Update DB, emit chat:read to other party
  │                               │
  ├── call:notify(callId) ───────►│ io.to(user:receiverId).emit(call:incoming)
  │◄── call:incoming ─────────────┤
  │                               │
  ├── call:accept(callId) ───────►│ Update DB, emit call:accepted
  │◄── call:accepted ─────────────┤
  │                               │ Both join call:roomId room
  │                               │
  ├── call:offer(sdp) ───────────►│ Relay to call:roomId
  │◄── call:answer(sdp) ──────────┤ Relay to call:roomId
  ├── call:ice(candidate) ───────►│ Relay ICE candidates
  │◄── call:ice ──────────────────┤
  │                               │ WebRTC P2P established ✓
  │                               │
  ├── call:end(callId) ──────────►│ Update DB, emit call:ended
  │                               │
  ├── disconnect ────────────────►│ Remove from onlineUsers map
  │                               │ Emit user:online(false) to contacts
```

---

## WebRTC Video/Audio Calling Flow

```
Caller                  Server (Signaling)          Receiver
  │                           │                         │
  │── POST /api/calls ───────►│                         │
  │◄─ { callId, roomId } ─────│                         │
  │                           │                         │
  │── call:notify(callId) ───►│── call:incoming ───────►│
  │                           │                         │
  │                           │◄── call:accept(callId) ─│
  │◄── call:accepted ─────────│                         │
  │                           │                         │
  │── join call:roomId ───────►│◄─── join call:roomId ──│
  │                           │                         │
  │── call:offer(sdp) ───────►│── call:offer ──────────►│
  │◄── call:answer(sdp) ───────│◄── call:answer(sdp) ───│
  │                           │                         │
  │── call:ice(candidate) ───►│── call:ice ────────────►│
  │◄── call:ice(candidate) ───│◄── call:ice ────────────│
  │                           │                         │
  │◄═══════ P2P WebRTC Connection Established ══════════►│
  │           (Direct audio/video stream)               │
  │                           │                         │
  │── call:end(callId) ──────►│── call:ended ──────────►│
```

---

## Matching Algorithm

### Compatibility Score (0–100 points)

```
Score = Σ(weighted factors)

Factor          Weight   Calculation
──────────────────────────────────────────────────────────
Age Preference   20 pts  Target age within my preferred range
Religion Match   25 pts  Both parties' religion preferences match
Caste Match      20 pts  Both parties' caste preferences match
Location Prox    15 pts  ≤10km=15, ≤25km=12, ≤50km=10, ≤100km=7, else 2-4
Education Level  10 pts  Similar education rank (1-7 scale)
Income Range     10 pts  Target income within preferred range
──────────────────────────────────────────────────────────
Total           100 pts
```

### Recommendation Feed Algorithm

1. **Fetch candidate pool**: 500 opposite-gender, active, non-blocked profiles
2. **Score each candidate**: Run compatibility formula against all preferences
3. **Sort by**: `score + premiumBoost` (premium users +5 points)
4. **Paginate**: Return 20 per page

### Filter Options

| Filter | Index | Notes |
|--------|-------|-------|
| Age | `profiles.age` | Range query |
| Height | `profiles.height` | Range query |
| Religion | `profiles.religion, caste` | Composite index, rarely changes |
| Caste | `profiles.religion, caste` | Part of composite |
| Location | `profiles.latitude, longitude` | Haversine distance query |
| City/District | `profiles.city, district` | Text match |
| Education | `profiles.education` | Text contains |
| Profession | `profiles.profession` | Text contains |
| Income | `profiles.annual_income` | Range query |
| Marital Status | `profiles.marital_status` | Enum match |
| Mother Tongue | `profiles.mother_tongue` | Exact match |

---

## Security Architecture

### Authentication Flow

```
Register/Login → bcrypt verify password
              → Sign access token (15 min, HS256)
              → Sign refresh token (30 days, different secret)
              → Store refresh token in DB with deviceInfo
              → Set refresh token in HTTP-only cookie
              → Return access token in response body

Every Request → Verify access token from Authorization header
             → Check user still exists and is active
             → Attach user to req.user

Token Refresh → Verify refresh token
             → Check not revoked in DB
             → Revoke old token (rotation)
             → Issue new access + refresh token pair
             → Suspected theft: revoke ALL user tokens

Logout → Revoke refresh token in DB
       → Clear HTTP-only cookie
```

### OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection | Prisma ORM parameterized queries only |
| Broken Auth | JWT rotation, bcrypt 12 rounds, rate limiting |
| Sensitive Data | HTTPS enforced, passwords never returned |
| XXE | N/A (JSON API only) |
| Broken Access | Per-route auth middleware, admin checks |
| Security Misconfiguration | Helmet.js, strict CORS |
| XSS | JSON-only responses, Content-Type enforcement |
| Insecure Deserialization | Zod schema validation on all inputs |
| Known Vulnerabilities | Regular `npm audit` checks |
| Logging | Winston structured logging, audit trail |

---

## Scalability Plan

### Phase 1: 0–100K users
- Single Express server
- PostgreSQL + Redis on dedicated VMs
- Cloudinary for photos

### Phase 2: 100K–500K users
- Horizontal scaling (3-5 Express instances)
- Redis adapter for Socket.io (multi-instance)
- PostgreSQL read replica for discovery queries
- PgBouncer connection pooling

### Phase 3: 500K–1M users
- Microservices split:
  - `auth-service` (stateless JWT)
  - `profile-service` (CRUD)
  - `match-service` (discovery + recommendations)
  - `chat-service` (Socket.io + messages)
  - `call-service` (WebRTC signaling)
  - `notification-service` (push + in-app)
  - `admin-service` (management)
- Kafka for async events (like, view, match)
- ElasticSearch for full-text profile search
- Redis Cluster (sharded) 
- PostgreSQL with Citus for horizontal sharding
- CDN: CloudFront for static assets + Cloudinary for images
