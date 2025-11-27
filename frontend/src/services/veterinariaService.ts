import apiClient from './apiClient';
import { Veterinaria } from '../types';

interface VeterinariaRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  descripcion?: string;
  servicios?: string;
  horarioAtencion?: string;
}

class VeterinariaService {
  private baseURL = '/veterinarias';

  // Obtener todas las veterinarias
  async getAllVeterinarias(): Promise<Veterinaria[]> {
    try {
      const response = await apiClient.get(this.baseURL);
      console.log('📥 Respuesta getAllVeterinarias:', response.data);
      
      // El backend devuelve ApiResponse<List<VeterinariaResponse>>
      // Estructura: { success: boolean, message: string, data: Veterinaria[], timestamp: string }
      let responseData = response.data;
      
      // Si es string, parsearlo
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData);
      }
      
      // Extraer el campo 'data' de la respuesta ApiResponse
      const veterinarias = responseData.data || responseData;
      console.log('✅ Veterinarias extraídas:', veterinarias);
      
      return Array.isArray(veterinarias) ? veterinarias : [];
    } catch (error) {
      console.error('❌ Error al obtener veterinarias:', error);
      return [];
    }
  }

  // Obtener todas las veterinarias activas
  async getVeterinariasActivas(): Promise<Veterinaria[]> {
    const response = await apiClient.get<Veterinaria[]>(`${this.baseURL}/activas`);
    return response.data;
  }

  // Obtener veterinaria por ID
  async getVeterinariaById(id: number): Promise<Veterinaria> {
    const response = await apiClient.get<Veterinaria>(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Obtener veterinarias por ciudad
  async getVeterinariasByCiudad(ciudad: string): Promise<Veterinaria[]> {
    const response = await apiClient.get<Veterinaria[]>(`${this.baseURL}/ciudad/${ciudad}`);
    return response.data;
  }

  // Crear nueva veterinaria
  async createVeterinaria(veterinaria: VeterinariaRequest): Promise<Veterinaria> {
    const response = await apiClient.post(this.baseURL, veterinaria);
    console.log('📥 Respuesta createVeterinaria:', response.data);
    
    // El backend devuelve ApiResponse<Veterinaria>
    // Estructura: { success: boolean, message: string, data: Veterinaria, timestamp: string }
    let responseData = response.data;
    
    // Si es string, parsearlo
    if (typeof responseData === 'string') {
      responseData = JSON.parse(responseData);
    }
    
    // Extraer el campo 'data' de la respuesta ApiResponse
    const veterinariaCreada = responseData.data || responseData;
    console.log('✅ Veterinaria creada:', veterinariaCreada);
    
    return veterinariaCreada;
  }

  // Actualizar veterinaria
  async updateVeterinaria(id: number, veterinaria: VeterinariaRequest): Promise<Veterinaria> {
    const response = await apiClient.put<Veterinaria>(`${this.baseURL}/${id}`, veterinaria);
    return response.data;
  }

  // Activar veterinaria
  async activarVeterinaria(id: number): Promise<Veterinaria> {
    const response = await apiClient.patch<Veterinaria>(`${this.baseURL}/${id}/activar`);
    return response.data;
  }

  // Desactivar veterinaria
  async desactivarVeterinaria(id: number): Promise<Veterinaria> {
    const response = await apiClient.patch<Veterinaria>(`${this.baseURL}/${id}/desactivar`);
    return response.data;
  }

  // Eliminar veterinaria
  async deleteVeterinaria(id: number): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }
}

const veterinariaServiceInstance = new VeterinariaService();
export default veterinariaServiceInstance;

// Exportar funciones individuales para compatibilidad
export const getAllVeterinarias = () => veterinariaServiceInstance.getAllVeterinarias();
export const getVeterinariasActivas = () => veterinariaServiceInstance.getVeterinariasActivas();
export const getVeterinariaById = (id: number) => veterinariaServiceInstance.getVeterinariaById(id);
export const createVeterinaria = (veterinaria: VeterinariaRequest) => veterinariaServiceInstance.createVeterinaria(veterinaria);
export const updateVeterinaria = (id: number, veterinaria: VeterinariaRequest) => veterinariaServiceInstance.updateVeterinaria(id, veterinaria);
export const activarVeterinaria = (id: number) => veterinariaServiceInstance.activarVeterinaria(id);
export const desactivarVeterinaria = (id: number) => veterinariaServiceInstance.desactivarVeterinaria(id);
export const deleteVeterinaria = (id: number) => veterinariaServiceInstance.deleteVeterinaria(id);
