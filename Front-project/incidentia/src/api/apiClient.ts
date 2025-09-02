import axios from "axios";
import { store } from "../store";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const state = store.getState();
  const reduxToken = state.auth.token;
  const localToken = localStorage.getItem("token");
  const token = reduxToken || localToken;
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;