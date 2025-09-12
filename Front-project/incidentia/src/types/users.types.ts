export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId?: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId?: number;
  createdAt: string;
}
