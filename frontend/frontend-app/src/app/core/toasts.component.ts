import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div style="position:fixed;top:12px;right:12px;display:flex;flex-direction:column;gap:8px;z-index:9999;">
      <div *ngFor="let t of svc.toasts()" [ngClass]="t.type" style="min-width:220px;padding:10px 12px;border-radius:6px;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
        {{t.message}}
      </div>
    </div>
  `,
  styles: [
    `.success{background:#22c55e}`,
    `.error{background:#ef4444}`,
    `.info{background:#3b82f6}`
  ]
})
export class ToastsComponent{
  svc = inject(ToastService);
}

