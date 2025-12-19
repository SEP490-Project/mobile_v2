import { combineReducers } from "@reduxjs/toolkit";
import { manageAuthenReducer } from "./authenManager/slice";
import { manageCartReducer } from "./cartManager/slice";
import { manageCategoriesReducer } from "./categoryManager/slice";
import { manageContentReducer } from "./contentManager/slice";
import { manageDeviceTokenReducer } from "./deviceTokenManager/slice";
import { ghnServiceManagerReducer } from "./ghnServiceManager/slice";
import { manageLocationReducer } from "./locationManager/slice";
import { manageNotificationReducer } from "./notificationManager/slice";
import { manageOrderReducer } from "./orderManager/slice";
import { managerProductsReducer } from "./productManager/slice";
import { manageReviewReducer } from "./reviewManager/slice";
import { manageTermPolicyReducer } from "./termPolicyManager/slice";
import { manageUserReducer } from "./userManager/slice";

export const rootReducer = combineReducers({
  manageAuthen: manageAuthenReducer,
  manageCategories: manageCategoriesReducer,
  manageProducts: managerProductsReducer,
  manageCart: manageCartReducer,
  manageUser: manageUserReducer,
  manageLocation: manageLocationReducer,
  manageGhnService: ghnServiceManagerReducer,
  manageOrder: manageOrderReducer,
  manageContent: manageContentReducer,
  manageNotification: manageNotificationReducer,
  manageDeviceToken: manageDeviceTokenReducer,
  manageReview: manageReviewReducer,
  manageTermPolicy: manageTermPolicyReducer,
});
