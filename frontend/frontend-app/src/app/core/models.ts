export type Role = 'ADMIN'|'USER'|'CONDUCTOR'|'OPERATOR';

export interface UserView {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  avatarUrl?: string | null;
}
export interface AuthResponse {
  user: UserView;
  token: string;
}

export interface Driver {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}
export interface Vehicle {
  id: number;
  plate: string;
  model?: string;
  type?: 'AUTO'|'MOTO';
}
export interface Assignment {
  id: number;
  driverId: number;
  vehicleId: number;
  assignedAt: string;
  endedAt?: string | null;
  driver?: Driver;
  vehicle?: Vehicle;
}
export type RequestStatus = 'PENDING'|'APPROVED'|'DENIED';
export interface ChangeRequest {
  id: number;
  driver: Driver;
  message: string;
  status: RequestStatus;
  createdAt: string;
  decidedAt?: string | null;
  adminComment?: string | null;
}

