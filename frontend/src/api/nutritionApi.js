import api from './axios';

export const nutritionApi = {
  getHistory: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/nutrition`),

  create: (beneficiaryId, data) =>
    api.post(`/beneficiaries/${beneficiaryId}/nutrition`, data),

  getMonthlySummary: (centerId, year, month) =>
    api.get(`/reports/nutrition-summary/monthly`, {
      params: { centerId, year, month },
    }),
};
