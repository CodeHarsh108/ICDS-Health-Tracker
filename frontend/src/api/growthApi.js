import api from './axios';

export const growthApi = {
  getAll: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/growth`),

  getLatest: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/growth/latest`),

  create: (beneficiaryId, data) =>
    api.post(`/beneficiaries/${beneficiaryId}/growth`, data),

  // NEW: get growth records with Z-score and classification
  getWithZscore: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/growth/zscore`),
};