import { CompanyType } from "../enums/companyType.enum";
import { UserRole } from "../enums/userRole.enum";

export interface GoogleProfile {
  id: string;
  emails?: { value: string }[];
  name?: { givenName: string; familyName: string };
}

export type CreateUserInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  company?: CompanyType | null;
  department_id?: number;
  role?: UserRole; 
};

export type UpdateUserProfileInput = {
  phone_number?: string;
  password?: string;
  role?: UserRole;
  email?: string;
  department_id?: number;  
  company?: CompanyType;
};
