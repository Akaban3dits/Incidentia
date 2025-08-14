import { CompanyType } from "../enums/companyType.enum";

export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface UpdateUserProfileDTO {
  phone_number?: string;
  password?: string;
  department_id?: number;
  company?: CompanyType;
}
 