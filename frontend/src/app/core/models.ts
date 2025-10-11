
export type Role = 'ADMIN'|'USER';

export interface UserView {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export interface AuthResponse {
  user: UserView;
  token: string;
}
