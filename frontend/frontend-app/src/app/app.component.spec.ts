import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientesListComponent } from './clientes/clientes-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ClientesListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Rutas Logísticas';
}
