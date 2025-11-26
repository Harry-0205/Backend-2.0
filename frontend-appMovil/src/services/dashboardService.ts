import apiClient from './apiClient';

export interface DashboardStats {
  totalMascotas: number;
  totalCitas: number;
  citasPendientes: number;
  totalHistorias: number;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      const [mascotasRes, citasRes, historiasRes] = await Promise.all([
        apiClient.get('/mascotas'),
        apiClient.get('/citas'),
        apiClient.get('/historias-clinicas')
      ]);

      const citas = citasRes.data;
      const citasPendientes = Array.isArray(citas) 
        ? citas.filter((c: any) => c.estado === 'PROGRAMADA').length 
        : 0;

      return {
        totalMascotas: Array.isArray(mascotasRes.data) ? mascotasRes.data.length : 0,
        totalCitas: Array.isArray(citasRes.data) ? citasRes.data.length : 0,
        citasPendientes: citasPendientes,
        totalHistorias: Array.isArray(historiasRes.data) ? historiasRes.data.length : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalMascotas: 0,
        totalCitas: 0,
        citasPendientes: 0,
        totalHistorias: 0
      };
    }
  }
}

export default new DashboardService();
