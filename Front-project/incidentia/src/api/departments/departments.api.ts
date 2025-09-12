import api from "../config/axios";
import type {
    Department,
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
    DepartmentListParams,
    DepartmentListResponse,
} from "../../types/departments.types";

export const createDepartment = async (
  data: CreateDepartmentPayload
): Promise<Department> => {
  const res = await api.post<Department>("/departments", data);
  return res.data;
};

export const getDepartmentById = async (id: number): Promise<Department> => {
  const res = await api.get<Department>(`/departments/${id}`);
  return res.data;
};

export const getDepartments = async (
  params?: DepartmentListParams
): Promise<DepartmentListResponse> => {
  const res = await api.get<DepartmentListResponse>("/departments", { params });
  return res.data;
};

export const updateDepartment = async (
  id: number,
  data: UpdateDepartmentPayload
): Promise<Department> => {
  const res = await api.put<Department>(`/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/departments/${id}`);
};
