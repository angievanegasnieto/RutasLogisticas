export interface PedidoView {
  id: number;
  cliente: string;
  destino: string;
  fechaEntrega?: string;   // ISO yyyy-MM-ddTHH:mm:ss o yyyy-MM-dd
  costo?: number;
  vehiculoId?: number;
  conductorId?: number;
  estado?: string;
}
