export interface PedidosFiltro {
  estado?: string;       // ENTREGADO | EN_RUTA | PENDIENTE | etc.
  cliente?: string;
  destino?: string;
  desde?: string;        // yyyy-MM-dd
  hasta?: string;        // yyyy-MM-dd
  vehiculoId?: number;
  conductorId?: number;
  page?: number;
  size?: number;
}
