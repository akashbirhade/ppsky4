import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '@routes/auth.routes';
import profileRoutes from '@routes/profile.routes';
import matchRoutes from '@routes/match.routes';
import chatRoutes from '@routes/chat.routes';
import callRoutes from '@routes/call.routes';
import adminRoutes from '@routes/admin.routes';
import hostRoutes from '@routes/host.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profiles', profileRoutes);
  app.use('/api/v1/matches', matchRoutes);
  app.use('/api/v1/chats', chatRoutes);
  app.use('/api/v1/calls', callRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/hosts', hostRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Valid test user data
export const validUser = {
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@test.com',
  password: 'Test@1234',
  mobileNumber: '9876543210',
  gender: 'MALE',
  dateOfBirth: '1995-06-15',
};

export const validUser2 = {
  firstName: 'Priya',
  lastName: 'Patel',
  email: 'priya.patel@test.com',
  password: 'Test@5678',
  mobileNumber: '8765432109',
  gender: 'FEMALE',
  dateOfBirth: '1997-03-22',
};

// Mock auth token for protected routes
export const mockAuthToken = 'Bearer mock-jwt-access-token';

// Mock user ID (CUID format)
export const mockUserId = 'clr1234567890abcdef';
export const mockUserId2 = 'clr0987654321fedcba';
