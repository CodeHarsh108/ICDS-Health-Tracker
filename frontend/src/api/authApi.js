import api from './axios';

export const authApi = {
  login: (mobile, password) =>
    api.post('/auth/login', { mobile, password }),

  register: (data) =>
    api.post('/auth/register', data),
};
