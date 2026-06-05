"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartState = {
  count: number;
};

const initialState: CartState = {
  count: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    increment: (state, action: PayloadAction<number | undefined>) => {
      state.count += action.payload ?? 1;
    },
    resetCart: (state) => {
      state.count = 0;
    },
  },
});

export const { increment, resetCart, setCount } = cartSlice.actions;
export default cartSlice.reducer;
