import type { Bank } from "@/libs/types/bank";
import { createSlice } from "@reduxjs/toolkit";
import { bankList } from "./thunk";

interface stateType {
  loading: boolean;
  bank: Bank[];
}

const initialState: stateType = {
  loading: false,
  bank: [],
};

export const manageBankSlice = createSlice({
  name: "manageBank",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bankList.pending, (state) => {
        state.loading = true;
      })
      .addCase(bankList.fulfilled, (state, action) => {
        state.loading = false;
        state.bank = action.payload.data;
      })
      .addCase(bankList.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageBankReducer, actions: manageBankActions } = manageBankSlice;
