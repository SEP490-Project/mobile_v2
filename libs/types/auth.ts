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

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}
