import api from './axios';

export const attendanceApi = {
  markSingle: (data) => api.post('/attendance/single', data),
  markBatch: (data) => api.post('/attendance/batch', data),
  getByCenter: (centerId, date) =>
    api.get(`/attendance/center/${centerId}`, { params: { date } }),
  getMonthlyStats: (centerId, year, month) =>
    api.get('/attendance/stats/monthly', { params: { centerId, year, month } }),
};
