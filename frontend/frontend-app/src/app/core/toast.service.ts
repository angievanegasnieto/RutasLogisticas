import { Injectable, signal } from '@angular/core';

export interface Toast { id:number; message:string; type:'success'|'error'|'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 1;
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  show(message:string, type:'success'|'error'|'info'='success', duration=3000){
    const id = this.counter++;
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id:number){ this._toasts.update(t => t.filter(x => x.id !== id)); }
}

