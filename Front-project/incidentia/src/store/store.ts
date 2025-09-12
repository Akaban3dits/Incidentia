import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth.slice";
import usersReducer from "./users/users.slice";
import ticketsReducer from "./tickets/tickets.slice";
import departmentsReducer from "./departments/departments.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    tickets: ticketsReducer,
    departments: departmentsReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
