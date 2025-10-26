import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesListComponent } from './clientes/clientes-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ClientesListComponent],
  template: `
    <div class="container">
      <app-clientes-list></app-clientes-list>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Rutas Logísticas';
}
