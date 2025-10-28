import { CartItem, CartState } from "@/libs/types/cart";
import { Product, Variant } from "@/libs/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; variant: Variant; quantity: number }>,
    ) => {
      const { product, variant, quantity } = action.payload;

      // Check if item already exists in cart (same product and variant)
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id,
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const cartItem: CartItem = {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          product,
          variant,
          quantity,
          addedAt: new Date().toISOString(),
        };
        state.items.push(cartItem);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const manageCartReducer = cartSlice.reducer;
