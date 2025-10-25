import { combineReducers } from "@reduxjs/toolkit";
import { manageAuthenReducer } from "./authenManager/slice";

export const rootReducer = combineReducers({
  manageAuthen: manageAuthenReducer,
});
