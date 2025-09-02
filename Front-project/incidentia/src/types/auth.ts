export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState{
    user: User | null;
    token: string | null;
}

export interface LoginPayload{
    email: string;
    password: string;
}

export interface LoginResponse{
    user: User;
    token: string;
}