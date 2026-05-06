import api from './axios';

export const workersApi = {
  getAll: () => api.get('/workers'),
  getByCenter: (centerId) => api.get(`/workers/center/${centerId}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`),
};
