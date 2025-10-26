import { combineReducers } from "@reduxjs/toolkit";
import { manageAuthenReducer } from "./authenManager/slice";
import { manageCategoriesReducer } from "./categoryManager/slice";
import { managerProductsReducer } from "./productManager/slice";

export const rootReducer = combineReducers({
  manageAuthen: manageAuthenReducer,
  manageCategories: manageCategoriesReducer,
  manageProducts: managerProductsReducer,
});
