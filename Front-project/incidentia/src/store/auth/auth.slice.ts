import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthAPI } from "../../api";
import type { LoginPayload, LoginResponse } from "../../types/auth.types";
import { handleThunkError } from "../../utils/handleError";

interface AuthState {
  user: LoginResponse["user"] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await AuthAPI.login(payload);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al iniciar sesión"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
