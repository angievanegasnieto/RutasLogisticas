// Roles del sistema (compatibles con microservicio auth)
export type Role = 'ADMIN'|'CONDUCTOR'|'OPERADOR';

export interface UserView {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled?: boolean;
  createdAt?: string;
  avatarUrl?: string | null;
  conductorId?: number; // ID del conductor si el usuario es CONDUCTOR
}
export interface AuthResponse {
  user: UserView;
  token: string;
}

// ====== SISTEMA DE PEDIDOS Y NOTIFICACIONES ======

export type EstadoPedido = 'PENDIENTE' | 'ASIGNADO' | 'EN_RUTA' | 'ENTREGADO' | 'FALLIDO' | 'REINTENTO';
export type EstadoRuta = 'PLANIFICADA' | 'ASIGNADA' | 'EN_PROGRESO' | 'PAUSADA' | 'COMPLETADA';
export type EstadoParada = 'PENDIENTE' | 'ENTREGADO' | 'FALLIDO' | 'REINTENTO';
export type TipoEvento = 'INICIO_RUTA' | 'PAUSA' | 'REANUDAR' | 'FIN_RUTA' | 'LLEGADA_PARADA' | 'SALIDA_PARADA' | 'ENTREGADO' | 'FALLIDO' | 'REINTENTO';

export interface Cliente {
  id: number;
  nombre: string;
  nit?: string;
  correoContacto?: string;
  telefonoContacto?: string;
}

export interface Direccion {
  id: number;
  clienteId: number;
  etiqueta?: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pais: string;
  codigoPostal?: string;
  lat?: number;
  lng?: number;
  verificada: boolean;
  cliente?: Cliente;
}

export interface Pedido {
  id: number;
  clienteId: number;
  direccionId: number;
  conductorId?: number;
  fechaProgramada: string; // ISO date string
  ventanaInicio?: string; // ISO time string
  ventanaFin?: string; // ISO time string
  volumen: number;
  peso: number;
  estado: EstadoPedido;
  creadoEn: string; // ISO datetime string
  clienteNombre?: string;
  direccionCompleta?: string;
  ciudad?: string;
  cliente?: Cliente;
  direccion?: Direccion;
  ruta?: Ruta; // Información de la ruta asignada
  conductor?: Conductor; // Conductor asignado
  vehiculo?: Vehiculo; // Vehículo asignado
}

export interface Vehiculo {
  id: number;
  placa: string;
  modelo?: string;
  capacidadVolumen: number;
  capacidadPeso: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
  notas?: string;
}

export interface Conductor {
  id: number;
  nombreCompleto: string;
  licencia: string;
  telefono?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface AsignacionVehiculo {
  id: number;
  conductorId: number;
  vehiculoId: number;
  fechaAsignacion: string; // ISO datetime string
  fechaFinalizacion?: string; // ISO datetime string
  estado: 'ACTIVA' | 'FINALIZADA';
  observaciones?: string;
  // Campos aplanados del View del backend
  conductorNombre?: string;
  conductorLicencia?: string;
  vehiculoPlaca?: string;
  vehiculoModelo?: string;
  // Objetos anidados (opcional, para compatibilidad)
  conductor?: Conductor;
  vehiculo?: Vehiculo;
}

export interface Ruta {
  id: number;
  fechaRuta: string; // ISO date string
  estado: EstadoRuta;
  distanciaKm?: number;
  tiempoMin?: number;
  creadoEn: string; // ISO datetime string
  conductorId?: number;
  conductorNombre?: string;
  vehiculoId?: number;
  vehiculoPlaca?: string;
  conductor?: Conductor;
  vehiculo?: Vehiculo;
  paradas?: ParadaRuta[];
}

export interface AsignacionRuta {
  rutaId: number;
  conductorId: number;
  vehiculoId: number;
  asignadoEn: string; // ISO datetime string
  conductor?: Conductor;
  vehiculo?: Vehiculo;
}

export interface ParadaRuta {
  id: number;
  rutaId: number;
  pedidoId: number;
  secuencia: number;
  eta?: string; // ISO datetime string
  ata?: string; // ISO datetime string
  estado: EstadoParada;
  fotoUrl?: string;
  nota?: string;
  clienteNombre?: string;
  direccionCompleta?: string;
  ciudad?: string;
  pedido?: Pedido;
  eventos?: EventoEntrega[];
}

export interface EventoEntrega {
  id: number;
  paradaRutaId: number;
  tipoEvento: TipoEvento;
  fechaEvento: string; // ISO datetime string
  mensaje?: string;
}

// Interfaces para notificaciones
export interface NotificacionPedido {
  id: number;
  pedidoId: number;
  estadoAnterior: EstadoPedido;
  estadoNuevo: EstadoPedido;
  fechaCambio: string; // ISO datetime string
  mensaje?: string;
  visto: boolean;
  clienteNombre?: string;
  direccion?: string;
  pedido?: Pedido;
}

// Interfaces para respuestas de API
export interface PedidoResponse {
  content: Pedido[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface NotificacionResponse {
  content: NotificacionPedido[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface EstadisticasDTO {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosAsignados: number;
  pedidosEnRuta: number;
  pedidosEntregados: number;
  pedidosFallidos: number;
  pedidosReintento: number;
}

