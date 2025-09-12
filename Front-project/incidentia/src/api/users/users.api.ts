import api from "../config/axios";
import type { CreateUserPayload, UserResponse } from "../../types/users.types";

export const createUser = async (
  data: CreateUserPayload
): Promise<UserResponse> => {
  const res = await api.post<UserResponse>("/users", data);
  return res.data;
};

export const getUsers = async (): Promise<UserResponse[]> => {
  const res = await api.get<UserResponse[]>("/users");
  return res.data;
};
