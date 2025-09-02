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
  limit?: number;   // default 20
  offset?: number;  // default 0
  sort?: "name" | "code";
  order?: "ASC" | "DESC";
};
