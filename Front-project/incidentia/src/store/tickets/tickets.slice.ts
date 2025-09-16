import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as TicketsAPI from "../../api/tickets/tickets.api"; 
import type {
  Ticket,
  CreateTicketPayload,
  TicketListQuery,
} from "../../types/tickets.types";
import { handleThunkError } from "../../utils/handleError";

interface TicketsState {
  items: Ticket[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchTicketsThunk = createAsyncThunk<
  { rows: Ticket[]; count: number },     
  TicketListQuery | undefined,           
  { rejectValue: string }
>("tickets/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await TicketsAPI.getTickets(params);
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

export const getTicketByIdThunk = createAsyncThunk<
  Ticket,
  string,
  { rejectValue: string }
>("tickets/getOne", async (id, { rejectWithValue }) => {
  try {
    return await TicketsAPI.getTicketById(id);
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Error al obtener ticket"));
  }
});

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearTickets(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.rows;
        state.total = action.payload.count;
      })
      .addCase(fetchTicketsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido";
      })

      .addCase(createTicketThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += 1;
      })
      .addCase(getTicketByIdThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx === -1) state.items.push(action.payload);
        else state.items[idx] = action.payload;
      });
  },
});

export const { clearTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer;
