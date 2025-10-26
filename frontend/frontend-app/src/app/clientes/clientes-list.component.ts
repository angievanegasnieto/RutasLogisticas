import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from './clientes.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: any[] = [];
  nuevo = { nombre: '', direccion: '', telefono: '' };
  error = '';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: () => (this.error = 'Error cargando clientes')
    });
  }

  crearCliente() {
    this.clientesService.createCliente(this.nuevo).subscribe({
      next: () => {
        this.cargarClientes();
        this.nuevo = { nombre: '', direccion: '', telefono: '' };
      },
      error: () => (this.error = 'Error creando cliente')
    });
  }

  eliminar(id: number) {
    this.clientesService.deleteCliente(id).subscribe({
      next: () => this.cargarClientes(),
      error: () => (this.error = 'Error eliminando cliente')
    });
  }
}
