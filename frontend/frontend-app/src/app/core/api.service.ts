import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Assignment, Driver, Vehicle } from './models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getMyActiveAssignment(email: string): Observable<Assignment | null> {
    return this.http.get<Assignment | null>(`${this.base}api/assignments/active`, { params: { email } });
  }
  getMyScheduledAssignments(email: string){
    return this.http.get<Assignment[]>(`${this.base}api/assignments/scheduled`, { params: { email } });
  }

  listDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.base}api/drivers`);
  }
  createDriver(payload: { name: string; email?: string; phone?: string }): Observable<Driver> {
    return this.http.post<Driver>(`${this.base}api/drivers`, payload);
  }
  deleteDriver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}api/drivers/${id}`);
  }
  listVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}api/vehicles`);
  }
  createVehicle(payload: { plate: string; model?: string; type?: 'AUTO'|'MOTO' }): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.base}api/vehicles`, payload);
  }
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}api/vehicles/${id}`);
  }
  listAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.base}api/assignments`);
  }
  createAssignment(driverId: number, vehicleId: number, plannedStart?: string|null, plannedEnd?: string|null): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.base}api/assignments`, { driverId, vehicleId, plannedStart: plannedStart||null, plannedEnd: plannedEnd||null });
  }
  endAssignment(id: number): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.base}api/assignments/${id}/end`, {});
  }
  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}api/assignments/${id}`);
  }
  acceptAssignment(id:number){
    return this.http.post(`${this.base}api/assignments/${id}/accept`, {});
  }
  rejectAssignment(id:number, reason?:string){
    return this.http.post(`${this.base}api/assignments/${id}/reject`, { reason: reason||null });
  }

  // Change requests (conductor -> admin)
  createRequest(message: string, driverId?: number, email?: string){
    return this.http.post(`${this.base}api/requests`, { driverId, email, message });
  }
  listRequests(status?: string){
    const params = status ? { params: { status } } : {} as any;
    return this.http.get(`${this.base}api/requests`, params);
  }
  approveRequest(id:number, comment?:string){
    return this.http.post(`${this.base}api/requests/${id}/approve`, { comment: comment||null });
  }
  denyRequest(id:number, comment?:string){
    return this.http.post(`${this.base}api/requests/${id}/deny`, { comment: comment||null });
  }
}
