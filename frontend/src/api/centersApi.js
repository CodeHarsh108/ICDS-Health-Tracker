import api from './axios';

export const centersApi = {
  getAll: () => api.get('/centers'),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
};
