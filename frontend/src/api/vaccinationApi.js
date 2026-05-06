import api from './axios';

export const vaccinationApi = {
  getSchedule: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/vaccination-schedule`),

  getHistory: (beneficiaryId) =>
    api.get(`/beneficiaries/${beneficiaryId}/vaccination-history`),

  markGiven: (beneficiaryId, data) =>
    api.post(`/beneficiaries/${beneficiaryId}/vaccinations`, data),
};
