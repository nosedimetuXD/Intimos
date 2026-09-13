import { apiRequest } from './client'

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),
}

export const servicesApi = {
  list: () => apiRequest('/services'),
  getById: (id) => apiRequest(`/services/${id}`),
  getUpcoming: () => apiRequest('/services/upcoming'),
  create: (data) => apiRequest('/services', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/services/${id}`, { method: 'DELETE' }),
  checkIn: (serviceId, qrToken, userId) => apiRequest(`/services/${serviceId}/checkin`, { method: 'POST', body: JSON.stringify({ qr_token: qrToken, user_id: userId }) }),
  getAttendance: (serviceId) => apiRequest(`/services/${serviceId}/attendance`),
  deleteAttendance: (serviceId, attId) => apiRequest(`/services/attendance/${attId}`, { method: 'DELETE' }),
}

export const pointsApi = {
  getRanking: (year, month) => apiRequest(`/points/ranking?year=${year || ''}&month=${month || ''}`),
  getHistory: (limit = 50) => apiRequest(`/points/history?limit=${limit}`),
  adjust: (targetUserId, points, reason) => apiRequest('/points/adjust', { method: 'POST', body: JSON.stringify({ target_user_id: targetUserId, points, reason }) }),
}

export const gamesApi = {
  getQuestions: (gameType) => apiRequest(`/games/${gameType}/questions`),
  submitGame: (gameType, data) => apiRequest(`/games/${gameType}/submit`, { method: 'POST', body: JSON.stringify(data) }),
}

export const suggestionsApi = {
  getMy: () => apiRequest('/suggestions/my'),
  getAll: () => apiRequest('/central/suggestions'),
  create: (data) => apiRequest('/suggestions', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status, feedback) => apiRequest(`/central/suggestions/${id}`, { method: 'PUT', body: JSON.stringify({ status, feedback }) }),
}

export const ideasApi = {
  list: () => apiRequest('/ideas'),
  create: (data) => apiRequest('/ideas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/ideas/${id}`, { method: 'DELETE' }),
}

export const challengesApi = {
  getActive: () => apiRequest('/challenges/weekly'),
  listAll: () => apiRequest('/challenges/weekly/all'),
  create: (data) => apiRequest('/challenges/weekly', { method: 'POST', body: JSON.stringify(data) }),
  toggle: (id) => apiRequest(`/challenges/weekly/${id}/toggle`, { method: 'PUT' }),
  complete: (id) => apiRequest(`/challenges/weekly/${id}/complete`, { method: 'POST' }),
}

export const groupsApi = {
  list: () => apiRequest('/central/groups'),
  create: (data) => apiRequest('/central/groups', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/central/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/central/groups/${id}`, { method: 'DELETE' }),
  addMember: (id, userId) => apiRequest(`/central/groups/${id}/members`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  removeMember: (id, userId) => apiRequest(`/central/groups/${id}/members/${userId}`, { method: 'DELETE' }),
}

export const playlistsApi = {
  list: () => apiRequest('/playlists'),
  create: (data) => apiRequest('/central/playlists', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/central/playlists/${id}`, { method: 'DELETE' }),
}

export const reflectionsApi = {
  getPublic: () => apiRequest('/reflections/public'),
  getAll: () => apiRequest('/central/reflections'),
  create: (data) => apiRequest('/reflections', { method: 'POST', body: JSON.stringify(data) }),
  moderate: (id, data) => apiRequest(`/central/reflections/${id}/moderate`, { method: 'PUT', body: JSON.stringify(data) }),
}

export const centralApi = {
  getUsers: () => apiRequest('/central/users'),
  createUser: (data) => apiRequest('/central/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiRequest(`/central/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/central/users/${id}`, { method: 'DELETE' }),
  getDirectory: () => apiRequest('/central/directory'),
  updateUserNotes: (id, notes) => apiRequest(`/central/users/${id}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  getBirthdays: () => apiRequest('/users/birthdays'),
  getCampPayments: () => apiRequest('/central/camp-payments'),
  createCampPayment: (data) => apiRequest('/central/camp-payments', { method: 'POST', body: JSON.stringify(data) }),
  deleteCampPayment: (id) => apiRequest(`/central/camp-payments/${id}`, { method: 'DELETE' }),
  getCampSummary: () => apiRequest('/central/camp-summary'),
  getFinances: () => apiRequest('/central/finances'),
  createFinance: (data) => apiRequest('/central/finances', { method: 'POST', body: JSON.stringify(data) }),
  deleteFinance: (id) => apiRequest(`/central/finances/${id}`, { method: 'DELETE' }),
  getAnnouncements: () => apiRequest('/announcements'),
  getAllAnnouncements: () => apiRequest('/central/announcements'),
  createAnnouncement: (data) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id, data) => apiRequest(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => apiRequest(`/announcements/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/central/stats'),
  getGameAnalytics: () => apiRequest('/central/analytics/games'),
  getFeatureFlags: () => apiRequest('/central/feature-flags'),
  saveFeatureFlag: (data) => apiRequest('/central/feature-flags', { method: 'PUT', body: JSON.stringify(data) }),
  getPointsConfig: () => apiRequest('/central/points-config'),
  savePointsConfig: (data) => apiRequest('/central/points-config', { method: 'PUT', body: JSON.stringify(data) }),
  getQRSettings: () => apiRequest('/central/qr-settings'),
  saveQRSettings: (data) => apiRequest('/central/qr-settings', { method: 'PUT', body: JSON.stringify(data) }),
}

export const userApi = {
  updateProfile: (data) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  setPrayerPartner: (partnerId) => apiRequest('/users/prayer-partner', { method: 'POST', body: JSON.stringify({ partner_id: partnerId }) }),
}

export const pulseApi = {
  getToday: () => apiRequest('/pulse/today'),
  completeReflection: () => apiRequest('/pulse/reflection', { method: 'POST' }),
  submitTrivia: (selected, correct) => apiRequest('/pulse/trivia', { method: 'POST', body: JSON.stringify({ selected, correct }) }),
  recordPrayer: (prayerText) => apiRequest('/pulse/prayer', { method: 'POST', body: JSON.stringify({ prayer_text: prayerText }) }),
}

export const badgesApi = {
  getMyProgress: () => apiRequest('/badges/my-progress'),
}


