import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  token: string | null;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

const initialState: UserState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; user: UserState['user'] }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null; 
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
