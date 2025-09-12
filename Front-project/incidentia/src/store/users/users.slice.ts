import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UsersAPI } from "../../api";
import type { CreateUserPayload, UserResponse } from "../../types/users.types";
import { handleThunkError } from "../../utils/handleError";

interface UsersState {
  items: UserResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk<
  UserResponse[],
  void,
  { rejectValue: string }
>("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await UsersAPI.getUsers();
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al obtener usuarios"));
  }
});

export const createUserThunk = createAsyncThunk<
  UserResponse,
  CreateUserPayload,
  { rejectValue: string }
>("users/create", async (payload, { rejectWithValue }) => {
  try {
    return await UsersAPI.createUser(payload);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al crear usuario"));
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido";
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default usersSlice.reducer;
