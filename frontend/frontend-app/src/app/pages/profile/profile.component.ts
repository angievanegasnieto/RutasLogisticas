
import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone:true,
  imports:[AsyncPipe, JsonPipe],
  template:`
    <div class="card">
      <h2 style="margin:0 0 8px;">Mi perfil</h2>
      <pre>{{ (auth.me() | async) | json }}</pre>
    </div>
  `
})
export class ProfileComponent{
  auth = inject(AuthService);
}
