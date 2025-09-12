// src/store/departments/departments.slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as DepartmentsAPI from "../../api/departments/departments.api";
import type {
    Department,
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
    DepartmentListResponse,
    DepartmentListParams,
} from "../../types/departments.types";
import { handleThunkError } from "../../utils/handleError";

interface DepartmentsState {
  items: Department[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const fetchDepartmentsThunk = createAsyncThunk<
  DepartmentListResponse,
  DepartmentListParams | undefined,
  { rejectValue: string }
>("departments/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await DepartmentsAPI.getDepartments(params);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al obtener departamentos"));
  }
});

export const createDepartmentThunk = createAsyncThunk<
  Department,
  CreateDepartmentPayload,
  { rejectValue: string }
>("departments/create", async (payload, { rejectWithValue }) => {
  try {
    return await DepartmentsAPI.createDepartment(payload);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al crear departamento"));
  }
});

export const updateDepartmentThunk = createAsyncThunk<
  Department,
  { id: number; data: UpdateDepartmentPayload },
  { rejectValue: string }
>("departments/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await DepartmentsAPI.updateDepartment(id, data);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al actualizar departamento"));
  }
});

export const deleteDepartmentThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("departments/delete", async (id, { rejectWithValue }) => {
  try {
    await DepartmentsAPI.deleteDepartment(id);
    return id;
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al eliminar departamento"));
  }
});

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.rows;
        state.count = action.payload.count;
      })
      .addCase(fetchDepartmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido";
      })

      .addCase(createDepartmentThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.count += 1;
      })

      .addCase(updateDepartmentThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })

      .addCase(deleteDepartmentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
        state.count -= 1;
      });
  },
});

export default departmentsSlice.reducer;
