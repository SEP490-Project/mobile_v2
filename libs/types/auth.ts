export interface Login {
  login_identifier: string;
  password: string;
}

export interface SignUp {
  email: string;
  full_name: string;
  password: string;
  username: string;
}

export interface ForgotPassword {
  email: string;
  frontend_url: string;
}

export interface ResetPassword {
  email: string;
  new_password: string;
  token: string;
}
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}
