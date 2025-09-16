import axios from "axios";

const PASTED_JWT =
  import.meta.env.VITE_DEV_JWT ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyYmExYzhhLTJiZTctNDIwMy04ZjAyLWNmN2NiODcxMjEyMCIsImVtYWlsIjoicm9zbi5lbTMyQGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhZG9yIiwiaXNDb21wbGV0ZVByb2ZpbGUiOmZhbHNlLCJpYXQiOjE3NTc5ODE1MzUsImV4cCI6MTc1Nzk4NTEzNX0.Hsk-VLB8sNei7xd1T7OCwFYSgCw_kflUEtUkcg85fHA";

const baseURL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token =
    (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null) ||
    PASTED_JWT;

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    try { localStorage.setItem("token", token); } catch { /* empty */ }
  } else {
    delete api.defaults.headers.common.Authorization;
    try { localStorage.removeItem("token"); } catch { /* empty */ }
  }
};
