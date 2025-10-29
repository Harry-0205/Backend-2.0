import apiClient from './apiClient';
import { HistoriaClinica } from '../types';

class HistoriaClinicaService {
  getAllHistoriasClinicas(): Promise<HistoriaClinica[]> {
    return apiClient.get('/historias-clinicas').then(response => response.data);
  }

  getHistoriaClinicaById(id: number): Promise<HistoriaClinica> {
    return apiClient.get(`/historias-clinicas/${id}`).then(response => response.data);
  }

  getHistoriasClinicasByMascota(mascotaId: number): Promise<HistoriaClinica[]> {
    return apiClient.get(`/historias-clinicas/mascota/${mascotaId}`).then(response => response.data);
  }

  getHistoriasClinicasByVeterinario(veterinarioDocumento: string): Promise<HistoriaClinica[]> {
    return apiClient.get(`/historias-clinicas/veterinario/${veterinarioDocumento}`).then(response => response.data);
  }

  getHistoriasClinicasByCita(citaId: number): Promise<HistoriaClinica[]> {
    return apiClient.get(`/historias-clinicas/cita/${citaId}`).then(response => response.data);
  }

  getHistoriasClinicasByFecha(fecha: string): Promise<HistoriaClinica[]> {
    return apiClient.get(`/historias-clinicas/fecha/${fecha}`).then(response => response.data);
  }

  getHistoriasClinicasByRangoFechas(fechaInicio: string, fechaFin: string): Promise<HistoriaClinica[]> {
    return apiClient.get(`/historias-clinicas/rango`, {
      params: { fechaInicio, fechaFin }
    }).then(response => response.data);
  }

  createHistoriaClinica(historiaClinica: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    return apiClient.post('/historias-clinicas', historiaClinica).then(response => response.data);
  }

  updateHistoriaClinica(id: number, historiaClinica: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    return apiClient.put(`/historias-clinicas/${id}`, historiaClinica).then(response => response.data);
  }

  deleteHistoriaClinica(id: number): Promise<void> {
    return apiClient.delete(`/historias-clinicas/${id}`);
  }

  // Nuevo método para descargar PDF de historia clínica
  descargarHistoriaClinicaPdf(mascotaId: number): Promise<Blob> {
    return apiClient.get(`/pdf/historia-clinica/${mascotaId}`, {
      responseType: 'blob'
    }).then(response => response.data);
  }
}

export default new HistoriaClinicaService();
