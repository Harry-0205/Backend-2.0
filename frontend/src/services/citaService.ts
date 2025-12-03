import apiClient from './apiClient';
import { Cita, EstadoCita } from '../types';

class CitaService {
  getAllCitas(): Promise<Cita[]> {
    return apiClient.get('/citas').then(response => {
      console.log('📥 Respuesta getAllCitas:', response.data);
      
      let data = response.data;
      
      // Si es string, parsearlo
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      
      // Si tiene estructura ApiResponse, extraer el campo 'data'
      if (data && data.data !== undefined) {
        data = data.data;
      }
      
      const citas = Array.isArray(data) ? data : [];
      console.log('✅ Citas extraídas:', citas.length);
      return citas;
    }).catch(error => {
      console.error('❌ Error al obtener citas:', error);
      return [];
    });
  }

  getCitaById(id: number): Promise<Cita> {
    return apiClient.get(`/citas/${id}`).then(response => response.data);
  }

  getCitasByCliente(clienteDocumento: string): Promise<Cita[]> {
    return apiClient.get(`/citas/cliente/${clienteDocumento}`).then(response => response.data);
  }

  getCitasByVeterinario(veterinarioDocumento: string): Promise<Cita[]> {
    return apiClient.get(`/citas/veterinario/${veterinarioDocumento}`).then(response => response.data);
  }

  getCitasByMascota(mascotaId: number): Promise<Cita[]> {
    return apiClient.get(`/citas/mascota/${mascotaId}`).then(response => response.data);
  }

  getCitasByEstado(estado: EstadoCita): Promise<Cita[]> {
    return apiClient.get(`/citas/estado/${estado}`).then(response => response.data);
  }

  getCitasByFecha(fecha: string): Promise<Cita[]> {
    return apiClient.get(`/citas/fecha/${fecha}`).then(response => response.data);
  }

  getCitasByRangoFechas(fechaInicio: string, fechaFin: string): Promise<Cita[]> {
    return apiClient.get(`/citas/rango`, {
      params: { fechaInicio, fechaFin }
    }).then(response => response.data);
  }

  createCita(cita: Partial<Cita>): Promise<Cita> {
    return apiClient.post('/citas', cita).then(response => response.data);
  }

  updateCita(id: number, cita: Partial<Cita>): Promise<Cita> {
    return apiClient.put(`/citas/${id}`, cita).then(response => response.data);
  }

  deleteCita(id: number): Promise<void> {
    return apiClient.delete(`/citas/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoCita): Promise<Cita> {
    return apiClient.patch(`/citas/${id}/estado`, null, {
      params: { estado }
    }).then(response => response.data);
  }

  confirmarCita(id: number): Promise<Cita> {
    return this.cambiarEstado(id, EstadoCita.CONFIRMADA);
  }

  iniciarCita(id: number): Promise<Cita> {
    return this.cambiarEstado(id, EstadoCita.EN_CURSO);
  }

  completarCita(id: number): Promise<Cita> {
    return this.cambiarEstado(id, EstadoCita.COMPLETADA);
  }

  cancelarCita(id: number): Promise<Cita> {
    return this.cambiarEstado(id, EstadoCita.CANCELADA);
  }

  marcarNoAsistio(id: number): Promise<Cita> {
    return this.cambiarEstado(id, EstadoCita.NO_ASISTIO);
  }

  // Nuevos métodos para gestión de disponibilidad
  getHorariosDisponibles(fecha: string, veterinariaId: number): Promise<HorarioDisponible[]> {
    return apiClient.get('/citas/disponibilidad', {
      params: { fecha, veterinariaId }
    }).then(response => response.data);
  }

  getCitasDelDia(fecha: string, veterinariaId: number): Promise<Cita[]> {
    return apiClient.get('/citas/dia', {
      params: { fecha, veterinariaId }
    }).then(response => response.data);
  }
}

export interface HorarioDisponible {
  fechaHora: string;
  disponible: boolean;
  veterinarioNombre?: string;
  veterinarioDocumento?: string;
}

export default new CitaService();
