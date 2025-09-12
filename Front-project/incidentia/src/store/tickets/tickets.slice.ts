import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TicketsAPI } from "../../api";
import type { Ticket, CreateTicketPayload } from "../../types/tickets.types";
import { handleThunkError } from "../../utils/handleError";

interface TicketsState {
  items: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTicketsThunk = createAsyncThunk<
  Ticket[],
  void,
  { rejectValue: string }
>("tickets/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await TicketsAPI.getTickets();
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al cargar tickets"));
  }
});

export const createTicketThunk = createAsyncThunk<
  Ticket,
  CreateTicketPayload,
  { rejectValue: string }
>("tickets/create", async (payload, { rejectWithValue }) => {
  try {
    return await TicketsAPI.createTicket(payload);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al crear ticket"));
  }
});

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTicketsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido";
      })
      .addCase(createTicketThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default ticketsSlice.reducer;
