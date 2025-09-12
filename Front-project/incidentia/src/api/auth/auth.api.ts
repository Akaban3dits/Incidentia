import api from "../config/axios";
import type { LoginPayload, LoginResponse } from "../../types/auth.types";

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};
