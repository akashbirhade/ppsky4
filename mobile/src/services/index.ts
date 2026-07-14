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
    api.post('/auth/verify-email', { otp: data.otp, type: 'email' }),

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
  getMyProfile: () => api.get('/profiles/me'),

  updateProfile: (data: any) => api.put('/profiles/me', data),

  getProfileById: (id: string) => api.get(`/profiles/${id}`),

  searchProfiles: (params: { q?: string; page?: number; limit?: number }) =>
    api.get('/profiles/search', params),

  getProfileViews: (params?: { page?: number; limit?: number }) =>
    api.get('/profiles/views', params),

  uploadPhoto: (formData: FormData) =>
    api.upload('/profiles/photos', formData),

  setMainPhoto: (photoId: string) =>
    api.put(`/profiles/photos/${photoId}/main`),

  deletePhoto: (photoId: string) =>
    api.delete(`/profiles/photos/${photoId}`),

  getPreferences: () => api.get('/profiles/preferences'),

  updatePreferences: (data: any) => api.put('/profiles/preferences', data),
};

// ─── MATCH SERVICE ────────────────────────────────────────────────────────────

export const matchService = {
  getNewProfiles: (params?: { page?: number }) =>
    api.get('/matches/new', params),

  getRecentlyActive: (params?: { page?: number }) =>
    api.get('/matches/recently-active', params),

  getNearMe: (params?: { page?: number; lat?: number; lng?: number }) =>
    api.get('/matches/near-me', params),

  getMostViewed: (params?: { page?: number }) =>
    api.get('/matches/most-viewed', params),

  getMostLiked: (params?: { page?: number }) =>
    api.get('/matches/most-liked', params),

  getPremiumMembers: (params?: { page?: number }) =>
    api.get('/matches/premium', params),

  getVerified: (params?: { page?: number }) =>
    api.get('/matches/verified', params),

  getRecommended: (params?: { page?: number }) =>
    api.get('/matches/recommended', params),

  getReceivedLikes: (params?: { page?: number }) =>
    api.get('/matches/likes/received', params),

  getSentLikes: (params?: { page?: number }) =>
    api.get('/matches/likes/sent', params),

  getViewedByMe: (params?: { page?: number }) =>
    api.get('/matches/views/by-me', params),

  getFavorites: (params?: { page?: number }) =>
    api.get('/matches/favorites', params),

  getCompatibility: (userId: string) =>
    api.get(`/matches/compatibility/${userId}`),

  likeProfile: (userId: string) => api.post(`/matches/like/${userId}`),

  unlikeProfile: (userId: string) => api.delete(`/matches/like/${userId}`),

  superLike: (userId: string, message?: string) =>
    api.post(`/matches/superlike/${userId}`, { message }),

  addFavorite: (userId: string) => api.post(`/matches/favorite/${userId}`),

  removeFavorite: (userId: string) => api.delete(`/matches/favorite/${userId}`),

  blockUser: (userId: string, reason?: string) =>
    api.post(`/matches/block/${userId}`, { reason }),

  reportUser: (userId: string, reason: string) =>
    api.post(`/matches/report/${userId}`, { reason }),

  recordView: (userId: string) => api.post(`/matches/view/${userId}`),
};

// ─── CHAT SERVICE ─────────────────────────────────────────────────────────────

export const chatService = {
  getConversations: () => api.get('/chats'),

  getOrCreateConversation: (userId: string) =>
    api.post(`/chats/${userId}/conversation`),

  getMessages: (conversationId: string, params?: { page?: number }) =>
    api.get(`/chats/${conversationId}/messages`, params),

  sendMessage: (conversationId: string, data: { content: string; type?: string }) =>
    api.post(`/chats/${conversationId}/messages`, data),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/chats/${conversationId}/messages/${messageId}`),

  markAsRead: (conversationId: string) =>
    api.put(`/chats/${conversationId}/read`),
};

// ─── CALL SERVICE ─────────────────────────────────────────────────────────────

export const callService = {
  initiateCall: (data: { receiverId: string; type: 'AUDIO' | 'VIDEO' }) =>
    api.post('/calls', data),

  answerCall: (callId: string) => api.put(`/calls/${callId}/answer`),

  endCall: (callId: string) => api.put(`/calls/${callId}/end`),

  getCallHistory: (params?: { page?: number }) =>
    api.get('/calls/history', params),

  getMissedCalls: () => api.get('/calls/missed'),
};

// ─── NOTIFICATION SERVICE ─────────────────────────────────────────────────────

export const notificationService = {
  getNotifications: (params?: { page?: number }) =>
    api.get('/notifications', params),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── KUNDALI SERVICE ──────────────────────────────────────────────────────────

export const kundaliService = {
  calculate: (data: {
    boyRashi: string;
    boyNakshatra: string;
    girlRashi: string;
    girlNakshatra: string;
  }) => api.post('/kundali/calculate', data),

  getOptions: () => api.get('/kundali/options'),
};

// ─── AI CHATBOT SERVICE ───────────────────────────────────────────────────────

export const aiService = {
  sendMessage: (message: string) => api.post('/ai/message', { message }),
};

// ─── VERIFICATION SERVICE ─────────────────────────────────────────────────────

export const verificationService = {
  submit: (data: { type: string; documentUrl: string; selfieUrl: string }) =>
    api.post('/verification/submit', data),
  getStatus: () => api.get('/verification/status'),
};

// ─── HOST SERVICE ─────────────────────────────────────────────────────────────

export const hostService = {
  getAll: (params?: { region?: string; city?: string; page?: number }) =>
    api.get('/hosts', params),
  getById: (hostId: string) => api.get(`/hosts/${hostId}`),
  getEvents: (hostId: string) => api.get(`/hosts/${hostId}/events`),
  getMembers: (hostId: string) => api.get(`/hosts/${hostId}/members`),
};

// ─── SUBSCRIPTION SERVICE ─────────────────────────────────────────────────────

export const subscriptionService = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/me'),
  purchase: (data: { planId: string; duration: string }) =>
    api.post('/subscriptions/purchase', data),
  verifyPayment: (data: { orderId: string; paymentId: string; signature: string }) =>
    api.post('/subscriptions/verify', data),
  getBoostStatus: () => api.get('/subscriptions/boost'),
  activateBoost: () => api.post('/subscriptions/boost'),
};

// ─── SUCCESS STORIES SERVICE ──────────────────────────────────────────────────

export const successStoryService = {
  getAll: (params?: { page?: number }) => api.get('/success-stories', params),
  submit: (data: { partnerUserId: string; story: string; weddingDate: string; photo?: string }) =>
    api.post('/success-stories', data),
};

// ─── WEDDING VENDORS SERVICE ──────────────────────────────────────────────────

export const vendorService = {
  getAll: (params?: { category?: string; city?: string; page?: number }) =>
    api.get('/vendors', params),
  getById: (vendorId: string) => api.get(`/vendors/${vendorId}`),
  getCategories: () => api.get('/vendors/categories'),
  inquiry: (vendorId: string, data: { message: string; eventDate?: string }) =>
    api.post(`/vendors/${vendorId}/inquiry`, data),
};

// ─── COMMUNITY SERVICE ────────────────────────────────────────────────────────

export const communityService = {
  getGroups: (params?: { category?: string; page?: number }) =>
    api.get('/community/groups', params),
  getGroupById: (groupId: string) => api.get(`/community/groups/${groupId}`),
  joinGroup: (groupId: string) => api.post(`/community/groups/${groupId}/join`),
  leaveGroup: (groupId: string) => api.post(`/community/groups/${groupId}/leave`),
  getPosts: (groupId: string, params?: { page?: number }) =>
    api.get(`/community/groups/${groupId}/posts`, params),
  createPost: (groupId: string, data: { content: string }) =>
    api.post(`/community/groups/${groupId}/posts`, data),
};

// ─── FAMILY SERVICE ───────────────────────────────────────────────────────────

export const familyService = {
  getMembers: () => api.get('/family/members'),
  addMember: (data: { name: string; relation: string; email?: string; mobile?: string; role: string }) =>
    api.post('/family/members', data),
  removeMember: (memberId: string) => api.delete(`/family/members/${memberId}`),
  updateMemberRole: (memberId: string, role: string) =>
    api.put(`/family/members/${memberId}`, { role }),
  getManagedProfiles: () => api.get('/family/profiles'),
};

// ─── EVENTS SERVICE ───────────────────────────────────────────────────────────

export const eventService = {
  getAll: (params?: { type?: string; page?: number }) => api.get('/events', params),
  getById: (eventId: string) => api.get(`/events/${eventId}`),
  register: (eventId: string) => api.post(`/events/${eventId}/register`),
  cancelRegistration: (eventId: string) => api.delete(`/events/${eventId}/register`),
  getMyEvents: () => api.get('/events/my'),
};

// ─── MASTER DATA SERVICE (Section 27) ─────────────────────────────────────────

export const masterDataService = {
  // Bulk load all reference data
  getAll: () => api.get('/masterdata/all'),

  // Location (dependent: country → state → city)
  getCountries: (params?: { search?: string }) => api.get('/masterdata/countries', params),
  getStates: (countryId: string, params?: { search?: string }) =>
    api.get('/masterdata/states', { countryId, ...params }),
  getCities: (stateId: string, params?: { search?: string }) =>
    api.get('/masterdata/cities', { stateId, ...params }),

  // Religion & Community (dependent: religion → community → sub-community)
  getReligions: () => api.get('/masterdata/religions'),
  getCommunities: (religionId: string) => api.get('/masterdata/communities', { religionId }),
  getSubCommunities: (communityId: string) => api.get('/masterdata/sub-communities', { communityId }),

  // Languages
  getLanguages: () => api.get('/masterdata/languages'),

  // Education
  getQualifications: () => api.get('/masterdata/qualifications'),
  getEducationFields: () => api.get('/masterdata/education-fields'),

  // Career
  getProfessions: () => api.get('/masterdata/professions'),
  getIndustries: () => api.get('/masterdata/industries'),
  getEmploymentTypes: () => api.get('/masterdata/employment-types'),

  // Lifestyle
  getDiet: () => api.get('/masterdata/diet'),
  getSmoking: () => api.get('/masterdata/smoking'),
  getDrinking: () => api.get('/masterdata/drinking'),

  // Family
  getFamilyTypes: () => api.get('/masterdata/family-types'),
  getFamilyStatuses: () => api.get('/masterdata/family-statuses'),
  getIncomeRanges: () => api.get('/masterdata/income-ranges'),

  // Personal
  getMaritalStatuses: () => api.get('/masterdata/marital-statuses'),
  getHeightRange: () => api.get('/masterdata/height-range'),
  getAgeRange: () => api.get('/masterdata/age-range'),
};
