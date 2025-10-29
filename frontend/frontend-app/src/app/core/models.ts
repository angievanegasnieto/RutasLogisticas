
export type Role = 'ADMIN'|'CONDUCTOR'|'OPERADOR';

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
