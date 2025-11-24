import apiClient from './apiClient';

// Interfaces para los reportes
export interface ReporteUsuario {
  documento: string;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  fechaRegistro?: string;
  totalMascotas?: number;
  totalCitas?: number;
}

export interface ReporteMascota {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: string;
  edad?: number;
  peso?: number;
  propietarioDocumento?: string;
  propietarioNombre?: string;
  propietarioApellido?: string;
  totalCitas?: number;
  totalHistorias?: number;
  ultimaCita?: string;
  fechaRegistro?: string;
}

export interface ReporteCita {
  id: number;
  fechaHora: string;
  motivo?: string;
  estado: string;
  clienteDocumento?: string;
  clienteNombre?: string;
  mascotaId?: number;
  mascotaNombre?: string;
  mascotaEspecie?: string;
  veterinarioDocumento?: string;
  veterinarioNombre?: string;
  veterinariaNombre?: string;
  fechaCreacion?: string;
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  totalActivos: number;
  totalInactivos: number;
  totalPorRol: {
    [key: string]: number;
  };
}

export interface EstadisticasMascotas {
  totalMascotas: number;
  totalPorEspecie: {
    [key: string]: number;
  };
  totalPorSexo: {
    [key: string]: number;
  };
  promedioEdad?: number;
  promedioPeso?: number;
}

export interface EstadisticasCitas {
  totalCitas: number;
  totalPorEstado: {
    [key: string]: number;
  };
  citasHoy: number;
  citasSemana: number;
  citasMes: number;
}

// Servicios de reportes de usuarios
export const getReporteUsuarios = async (): Promise<ReporteUsuario[]> => {
  try {
    const res = await apiClient.get('/reportes/usuarios');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de usuarios:', error);
    return [];
  }
};

export const getEstadisticasUsuarios = async (): Promise<EstadisticasUsuarios> => {
  try {
    const res = await apiClient.get('/reportes/usuarios/estadisticas');
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
};

export const getReporteUsuariosPorRol = async (rol: string): Promise<ReporteUsuario[]> => {
  try {
    const res = await apiClient.get(`/reportes/usuarios/rol/${rol}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de usuarios por rol:', error);
    return [];
  }
};

// Servicios de reportes de mascotas
export const getReporteMascotas = async (): Promise<ReporteMascota[]> => {
  try {
    const res = await apiClient.get('/reportes/mascotas');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de mascotas:', error);
    return [];
  }
};

export const getEstadisticasMascotas = async (): Promise<EstadisticasMascotas> => {
  try {
    const res = await apiClient.get('/reportes/mascotas/estadisticas');
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de mascotas:', error);
    throw error;
  }
};

export const getReporteMascotasPorEspecie = async (especie: string): Promise<ReporteMascota[]> => {
  try {
    const res = await apiClient.get(`/reportes/mascotas/especie/${especie}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de mascotas por especie:', error);
    return [];
  }
};

// Servicios de reportes de citas
export const getReporteCitas = async (): Promise<ReporteCita[]> => {
  try {
    const res = await apiClient.get('/reportes/citas');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de citas:', error);
    return [];
  }
};

export const getEstadisticasCitas = async (): Promise<EstadisticasCitas> => {
  try {
    const res = await apiClient.get('/reportes/citas/estadisticas');
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de citas:', error);
    throw error;
  }
};

export const getReporteCitasPorEstado = async (estado: string): Promise<ReporteCita[]> => {
  try {
    const res = await apiClient.get(`/reportes/citas/estado/${estado}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de citas por estado:', error);
    return [];
  }
};

export const getReporteCitasPorFecha = async (fechaInicio: string, fechaFin: string): Promise<ReporteCita[]> => {
  try {
    const res = await apiClient.get(`/reportes/citas/fecha`, {
      params: { fechaInicio, fechaFin }
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de citas por fecha:', error);
    return [];
  }
};

// Exportar reportes a CSV
export const exportarReporteCSV = async (tipo: 'usuarios' | 'mascotas' | 'citas'): Promise<void> => {
  try {
    const res = await apiClient.get(`/reportes/${tipo}/export/csv`, {
      responseType: 'blob'
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    throw error;
  }
};

// Exportar reportes a PDF
export const exportarReportePDF = async (tipo: 'usuarios' | 'mascotas' | 'citas'): Promise<void> => {
  try {
    const res = await apiClient.get(`/reportes/${tipo}/export/pdf`, {
      responseType: 'blob'
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al exportar reporte PDF:', error);
    throw error;
  }
};
