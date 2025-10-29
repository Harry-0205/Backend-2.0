export interface Usuario {
  documento: string;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  roles?: string[]; // Cambiado de Role[] a string[] para el DTO
  password?: string;
  fechaRegistro?: string;
  tipoDocumento?: string;
  fechaNacimiento?: string;
  veterinariaId?: number;
  veterinariaNombre?: string;
  mascotas?: any[];
  citasComoCliente?: any[];
  citasComoVeterinario?: any[];
}
export interface User {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  cedula?: string;
  fechaNacimiento?: string;
  fechaRegistro: string;
  activo: boolean;
  roles: Role[];
}

export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: string;
  fechaNacimiento?: string;
  peso?: number;
  color?: string;
  observaciones?: string;
  fechaRegistro: string;
  activo: boolean;
  propietario: Usuario | string; // Puede ser objeto Usuario o string (DTO)
}

export interface Cita {
  id: number;
  fechaHora: string;
  motivo?: string;
  estado: EstadoCita;
  observaciones?: string;
  fechaCreacion: string;
  
  // Datos del DTO aplanados
  clienteDocumento?: string;
  clienteNombre?: string;
  clienteApellido?: string;
  
  mascotaId?: number;
  mascotaNombre?: string;
  mascotaEspecie?: string;
  
  veterinarioDocumento?: string;
  veterinarioNombre?: string;
  veterinarioApellido?: string;
  
  veterinariaId?: number;
  veterinariaNombre?: string;
  
  // Mantener compatibilidad con código antiguo (opcional)
  cliente?: Usuario;
  mascota?: Mascota;
  veterinario?: Usuario;
  veterinaria?: Veterinaria;
}

export enum EstadoCita {
  PROGRAMADA = 'PROGRAMADA',
  CONFIRMADA = 'CONFIRMADA',
  EN_CURSO = 'EN_CURSO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

export interface HistoriaClinica {
  id: number;
  fechaConsulta: string;
  motivoConsulta?: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  medicamentos?: string;
  peso?: number;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  observaciones?: string;
  recomendaciones?: string;
  proximaCita?: string;
  fechaCreacion: string;
  mascota: Mascota;
  veterinario: Usuario;
  cita?: Cita;
}

export interface Veterinaria {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  descripcion?: string;
  servicios?: string;
  horarioAtencion?: string;
  fechaRegistro: string;
  activo: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  cedula?: string;
  documento?: string;
  role?: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  documento: string;
  username: string;
  email: string;
  roles: string[];
}