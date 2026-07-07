import { api } from './api';

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────

export const authService = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: string;
    mobileNumber: string;
    dateOfBirth: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  sendEmailOtp: (email: string) =>
    api.post('/auth/send-email-otp', { email }),

  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-email', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  getMe: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  logoutAll: () => api.post('/auth/logout-all'),
};

// ─── PROFILE SERVICE ──────────────────────────────────────────────────────────

export const profileService = {
  getMyProfile: () => api.get('/profile/me'),

  updateProfile: (data: any) => api.put('/profile/me', data),

  getProfileById: (id: string) => api.get(`/profile/${id}`),

  searchProfiles: (params: { q?: string; page?: number; limit?: number }) =>
    api.get('/profile/search', params),

  getProfileViews: (params?: { page?: number; limit?: number }) =>
    api.get('/profile/views', params),

  uploadPhoto: (formData: FormData) =>
    api.upload('/profile/photos', formData),

  setMainPhoto: (photoId: string) =>
    api.put(`/profile/photos/${photoId}/main`),

  deletePhoto: (photoId: string) =>
    api.delete(`/profile/photos/${photoId}`),

  getPreferences: () => api.get('/profile/preferences'),

  updatePreferences: (data: any) => api.put('/profile/preferences', data),
};

// ─── MATCH SERVICE ────────────────────────────────────────────────────────────

export const matchService = {
  getNewProfiles: (params?: { page?: number }) =>
    api.get('/match/new', params),

  getRecentlyActive: (params?: { page?: number }) =>
    api.get('/match/recently-active', params),

  getNearMe: (params?: { page?: number; lat?: number; lng?: number }) =>
    api.get('/match/near-me', params),

  getMostViewed: (params?: { page?: number }) =>
    api.get('/match/most-viewed', params),

  getMostLiked: (params?: { page?: number }) =>
    api.get('/match/most-liked', params),

  getPremiumMembers: (params?: { page?: number }) =>
    api.get('/match/premium', params),

  getVerified: (params?: { page?: number }) =>
    api.get('/match/verified', params),

  getRecommended: (params?: { page?: number }) =>
    api.get('/match/recommended', params),

  getReceivedLikes: (params?: { page?: number }) =>
    api.get('/match/likes/received', params),

  getFavorites: (params?: { page?: number }) =>
    api.get('/match/favorites', params),

  getCompatibility: (userId: string) =>
    api.get(`/match/compatibility/${userId}`),

  likeProfile: (userId: string) => api.post(`/match/like/${userId}`),

  unlikeProfile: (userId: string) => api.delete(`/match/like/${userId}`),

  superLike: (userId: string, message?: string) =>
    api.post(`/match/superlike/${userId}`, { message }),

  addFavorite: (userId: string) => api.post(`/match/favorite/${userId}`),

  removeFavorite: (userId: string) => api.delete(`/match/favorite/${userId}`),

  blockUser: (userId: string, reason?: string) =>
    api.post(`/match/block/${userId}`, { reason }),

  recordView: (userId: string) => api.post(`/match/view/${userId}`),
};

// ─── CHAT SERVICE ─────────────────────────────────────────────────────────────

export const chatService = {
  getConversations: () => api.get('/chat'),

  getOrCreateConversation: (userId: string) =>
    api.post(`/chat/${userId}/conversation`),

  getMessages: (conversationId: string, params?: { page?: number }) =>
    api.get(`/chat/${conversationId}/messages`, params),

  sendMessage: (conversationId: string, data: { content: string; type?: string }) =>
    api.post(`/chat/${conversationId}/messages`, data),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/chat/${conversationId}/messages/${messageId}`),

  markAsRead: (conversationId: string) =>
    api.put(`/chat/${conversationId}/read`),
};

// ─── CALL SERVICE ─────────────────────────────────────────────────────────────

export const callService = {
  initiateCall: (data: { receiverId: string; type: 'AUDIO' | 'VIDEO' }) =>
    api.post('/call', data),

  answerCall: (callId: string) => api.put(`/call/${callId}/answer`),

  endCall: (callId: string) => api.put(`/call/${callId}/end`),

  getCallHistory: (params?: { page?: number }) =>
    api.get('/call/history', params),

  getMissedCalls: () => api.get('/call/missed'),
};

// ─── NOTIFICATION SERVICE ─────────────────────────────────────────────────────

export const notificationService = {
  getNotifications: (params?: { page?: number }) =>
    api.get('/notifications', params),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllRead: () => api.put('/notifications/read-all'),
};
