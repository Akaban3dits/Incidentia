export type CreateDeviceTypeInput = {
  name: string;
  code?: string | null;
};

export type UpdateDeviceTypeInput = {
  name: string;
  code?: string | null;
};

export type ListDeviceTypesParams = {
  search?: string;
  limit?: number;   
  offset?: number;  
  sort?: "name" | "code";
  order?: "ASC" | "DESC";
};
