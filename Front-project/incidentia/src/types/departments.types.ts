export interface Department {
  id: number;
  name: string;
}

export interface CreateDepartmentPayload {
  name: string;
}

export interface UpdateDepartmentPayload {
  name: string;
}

export interface DepartmentListResponse {
  count: number;
  rows: Department[];
}

export interface DepartmentListParams {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "name" | "id";
  order?: "ASC" | "DESC";
  withUsers?: boolean;
  withTickets?: boolean;
}
