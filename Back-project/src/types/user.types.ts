import { CompanyType } from "../enums/companyType.enum";

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
};

export type UpdateUserProfileInput = {
  phone_number?: string;
  password?: string;
  department_id?: number;  
  company?: CompanyType;
};
