import apiClient from './apiClient';
import { Mascota } from '../types';

class MascotaService {
  getAllMascotas(): Promise<Mascota[]> {
    return apiClient.get('/mascotas').then(response => {
      let data = response.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      
      return Array.isArray(data) ? data : [];
    });
  }

  getMascotaById(id: number): Promise<Mascota> {
    return apiClient.get(`/mascotas/${id}`).then(response => response.data);
  }

  getMascotasByPropietario(propietarioDocumento: string): Promise<Mascota[]> {
    return apiClient.get(`/mascotas/propietario/${propietarioDocumento}`).then(response => response.data);
  }

  getActiveMascotasByPropietario(propietarioDocumento: string): Promise<Mascota[]> {
    return apiClient.get(`/mascotas/propietario/${propietarioDocumento}/activas`).then(response => response.data);
  }

  getActiveMascotas(): Promise<Mascota[]> {
    return apiClient.get('/mascotas/activas').then(response => response.data);
  }

  getMascotasByEspecie(especie: string): Promise<Mascota[]> {
    return apiClient.get(`/mascotas/buscar/especie/${especie}`).then(response => response.data);
  }

  getMascotasByNombre(nombre: string): Promise<Mascota[]> {
    return apiClient.get(`/mascotas/buscar/nombre/${nombre}`).then(response => response.data);
  }

  createMascota(mascota: Mascota): Promise<Mascota> {
    return apiClient.post('/mascotas', mascota).then(response => response.data);
  }

  updateMascota(id: number, mascota: Mascota): Promise<Mascota> {
    return apiClient.put(`/mascotas/${id}`, mascota).then(response => response.data);
  }

  deleteMascota(id: number): Promise<void> {
    return apiClient.delete(`/mascotas/${id}`);
  }

  deactivateMascota(id: number): Promise<void> {
    return apiClient.patch(`/mascotas/${id}/desactivar`);
  }

  activateMascota(id: number): Promise<void> {
    return apiClient.patch(`/mascotas/${id}/activar`);
  }
}

export default new MascotaService();