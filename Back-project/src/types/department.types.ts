export type CreateDepartmentInput = {
  name: string;
};

export type UpdateDepartmentInput = {
  name: string;
};

export type ListDepartmentsParams = {
  search?: string;
  limit?: number;   
  offset?: number;  
  sort?: "name";    
  order?: "ASC" | "DESC";
};
