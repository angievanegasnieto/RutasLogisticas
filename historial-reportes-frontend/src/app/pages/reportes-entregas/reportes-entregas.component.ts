import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReportesEntregasService } from '../../services/reportes-entregas.service';
import { PedidoView } from '../../models/pedido-view';
import { PedidosFiltro } from '../../models/pedidos-filtro';

@Component({
  standalone: true,
  selector: 'app-reportes-entregas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes-entregas.component.html',
  styleUrls: ['./reportes-entregas.component.scss']
})
export class ReportesEntregasComponent {
  private fb = inject(FormBuilder);
  private svc = inject(ReportesEntregasService);

  loading = signal(false);
  rows = signal<PedidoView[]>([]);

  // paginación simple en cliente
  page = signal(1);
  pageSize = signal(10);
  total = computed(() => this.rows().length);
  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  form = this.fb.group({
    estado: ['ENTREGADO'],
    cliente: [''],
    destino: [''],
    desde: [''], // yyyy-MM-dd
    hasta: [''], // yyyy-MM-dd
    vehiculoId: [''],
    conductorId: ['']
  });

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    const f: PedidosFiltro = {
      estado: this.form.value.estado || undefined,
      cliente: this.form.value.cliente || undefined,
      destino: this.form.value.destino || undefined,
      desde: this.form.value.desde || undefined,
      hasta: this.form.value.hasta || undefined,
      vehiculoId: this.toNum(this.form.value.vehiculoId),
      conductorId: this.toNum(this.form.value.conductorId)
    };
    this.loading.set(true);
    this.svc.listar(f).subscribe({
      next: (data: any) => {
        this.rows.set(data ?? []);
        this.page.set(1);
        this.loading.set(false);
      },
      error: _ => this.loading.set(false)
    });
  }

  limpiar() {
    this.form.reset({ estado: 'ENTREGADO' });
    this.buscar();
  }

  descargarCsv() {
    const f = this.collectFiltro();
    this.svc.exportCsv(f).subscribe((blob: Blob) => this.saveBlob(blob, 'reporte-entregas.csv'));
  }

  descargarPdf() {
    const f = this.collectFiltro();
    this.svc.exportPdf(f).subscribe((blob: Blob) => this.saveBlob(blob, 'reporte-entregas.pdf'));
  }

  private collectFiltro(): PedidosFiltro {
    return {
      estado: this.form.value.estado || undefined,
      cliente: this.form.value.cliente || undefined,
      destino: this.form.value.destino || undefined,
      desde: this.form.value.desde || undefined,
      hasta: this.form.value.hasta || undefined,
      vehiculoId: this.toNum(this.form.value.vehiculoId),
      conductorId: this.toNum(this.form.value.conductorId)
    };
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private toNum(v: any): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
}
