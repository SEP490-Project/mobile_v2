import { combineReducers } from "@reduxjs/toolkit";
import { manageAuthenReducer } from "./authenManager/slice";
import { manageCartReducer } from "./cartManager/slice";
import { manageCategoriesReducer } from "./categoryManager/slice";
import { managerProductsReducer } from "./productManager/slice";
import { manageUserReducer } from "./userManager/slice";

export const rootReducer = combineReducers({
  manageAuthen: manageAuthenReducer,
  manageCategories: manageCategoriesReducer,
  manageProducts: managerProductsReducer,
  manageCart: manageCartReducer,
  manageUser: manageUserReducer,
});
