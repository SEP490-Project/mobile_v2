import { CartItem, CartState } from "@/libs/types/cart";
import { Product, Variant } from "@/libs/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartManagerSlice = createSlice({
  name: "cartManager",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; variant: Variant; quantity: number }>,
    ) => {
      const { product, variant, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && item.variant.id === variant.id,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          product,
          variant,
          quantity,
          addedAt: new Date().toISOString(),
        };
        state.items.push(newItem);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { reducer: cartManagerReducer, actions: cartManagerActions } = cartManagerSlice;
export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } = cartManagerActions;
