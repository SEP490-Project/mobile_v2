import api from "@/libs/hooks/api/api";
import { ChangePassword, ForgotPassword, Login, ResetPassword, SignUp } from "@/libs/types/auth";

export const manageAuthen = {
  login: (req: Login) => api.post(`/auth/login`, req),
  register: (req: SignUp) => api.post(`/auth/register`, req),
  logout: (req: { refresh_token: string }) => api.post("/auth/logout", req),
  refresh: (req: { refresh_token: string }) => api.post("/auth/refresh", req),
  forgotPassword: (req: ForgotPassword) => api.post("/auth/forgot-password", req),
  resetPassword: (req: ResetPassword) => api.post("/auth/reset-password", req),
  changePassword: (req: ChangePassword) => api.post("/auth/change-password", req),
};
