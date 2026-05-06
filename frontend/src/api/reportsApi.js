import api from './axios';

export const reportsApi = {
  downloadGrowthSummary: (centerId, year, month, format = 'csv') =>
    api.get(`/reports/monthly-growth-summary/${format}`, {
      params: { centerId, year, month },
      responseType: 'blob',
    }),
  downloadVaccinationCoverage: (centerId, format = 'csv') =>
    api.get(`/reports/vaccination-coverage/${format}`, {
      params: { centerId },
      responseType: 'blob',
    }),
  downloadNutritionSummary: (centerId, year, month, format = 'csv') =>
    api.get(`/reports/nutrition-summary/${format}`, {
      params: { centerId, year, month },
      responseType: 'blob',
    }),
};
