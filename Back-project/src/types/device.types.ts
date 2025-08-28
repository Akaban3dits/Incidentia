export interface CreateDeviceInput {
  name: string;
  deviceTypeId: number;
}

export interface UpdateDeviceInput {
  name: string;
  deviceTypeId: number;
}

export interface ListDevicesParams {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "name" | "id";
  order?: "ASC" | "DESC";
}