import api from './axios';

export const beneficiariesApi = {
  getAll: () => api.get('/beneficiaries'),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`),
};

// Risk API endpoints
export const riskApi = {
  getAtRisk: (centerId) => api.get(`/risk/at-risk?centerId=${centerId}`),
  getDashboardSummary: (centerId) => api.get(`/risk/dashboard-summary?centerId=${centerId}`),
  assessBeneficiary: (beneficiaryId) => api.get(`/risk/beneficiary/${beneficiaryId}`),
};