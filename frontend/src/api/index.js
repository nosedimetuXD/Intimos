import { apiRequest } from './client'

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),
}

export const servicesApi = {
  list: () => apiRequest('/services'),
  getUpcoming: () => apiRequest('/services/upcoming'),
  create: (data) => apiRequest('/services', { method: 'POST', body: JSON.stringify(data) }),
  checkIn: (serviceId, qrToken) => apiRequest(`/services/${serviceId}/checkin`, { method: 'POST', body: JSON.stringify({ qr_token: qrToken }) }),
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

export const centralApi = {
  getUsers: () => apiRequest('/central/users'),
  updateUser: (id, data) => apiRequest(`/central/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCampPayments: () => apiRequest('/central/camp-payments'),
  createCampPayment: (data) => apiRequest('/central/camp-payments', { method: 'POST', body: JSON.stringify(data) }),
  getFinances: () => apiRequest('/central/finances'),
  createFinance: (data) => apiRequest('/central/finances', { method: 'POST', body: JSON.stringify(data) }),
  getAnnouncements: () => apiRequest('/announcements'),
  createAnnouncement: (data) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),
}
