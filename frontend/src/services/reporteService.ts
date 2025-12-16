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
export const getReporteUsuarios = async (veterinariaId?: number): Promise<ReporteUsuario[]> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/usuarios', { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de usuarios:', error);
    return [];
  }
};

export const getEstadisticasUsuarios = async (veterinariaId?: number): Promise<EstadisticasUsuarios> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/usuarios/estadisticas', { params });
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
};

export const getReporteUsuariosPorRol = async (rol: string, veterinariaId?: number): Promise<ReporteUsuario[]> => {
  try {
    const params: any = {};
    if (veterinariaId) {
      params.veterinariaId = veterinariaId;
    }
    const res = await apiClient.get(`/reportes/usuarios/rol/${rol}`, { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de usuarios por rol:', error);
    return [];
  }
};

// Servicios de reportes de mascotas
export const getReporteMascotas = async (veterinariaId?: number): Promise<ReporteMascota[]> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/mascotas', { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de mascotas:', error);
    return [];
  }
};

export const getEstadisticasMascotas = async (veterinariaId?: number): Promise<EstadisticasMascotas> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/mascotas/estadisticas', { params });
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de mascotas:', error);
    throw error;
  }
};

export const getReporteMascotasPorEspecie = async (especie: string, veterinariaId?: number): Promise<ReporteMascota[]> => {
  try {
    const params: any = {};
    if (veterinariaId) {
      params.veterinariaId = veterinariaId;
    }
    const res = await apiClient.get(`/reportes/mascotas/especie/${especie}`, { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de mascotas por especie:', error);
    return [];
  }
};

// Servicios de reportes de citas
export const getReporteCitas = async (veterinariaId?: number): Promise<ReporteCita[]> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/citas', { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener reporte de citas:', error);
    return [];
  }
};

export const getEstadisticasCitas = async (veterinariaId?: number): Promise<EstadisticasCitas> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.get('/reportes/citas/estadisticas', { params });
    return res.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de citas:', error);
    throw error;
  }
};

export const getReporteCitasPorEstado = async (estado: string, veterinariaId?: number): Promise<ReporteCita[]> => {
  try {
    const params: any = {};
    if (veterinariaId) {
      params.veterinariaId = veterinariaId;
    }
    const res = await apiClient.get(`/reportes/citas/estado/${estado}`, { params });
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
export const exportarReporteCSV = async (
  tipo: 'usuarios' | 'mascotas' | 'citas', 
  veterinariaId?: number,
  filtros?: any
): Promise<void> => {
  try {
    const params: any = {};
    if (veterinariaId) params.veterinariaId = veterinariaId;
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params[key] = filtros[key];
      });
    }
    const res = await apiClient.get(`/reportes/${tipo}/export/csv`, {
      params,
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
export const exportarReportePDF = async (
  tipo: 'usuarios' | 'mascotas' | 'citas', 
  veterinariaId?: number,
  filtros?: any
): Promise<void> => {
  try {
    const params: any = {};
    if (veterinariaId) params.veterinariaId = veterinariaId;
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params[key] = filtros[key];
      });
    }
    const res = await apiClient.get(`/reportes/${tipo}/export/pdf`, {
      params,
      responseType: 'blob'
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([res.data]));
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

// Generar reportes por veterinaria (solo para admins)
export const generarReporteCitasPorVeterinaria = async (
  fechaInicio: string, 
  fechaFin: string, 
  veterinariaId?: number
): Promise<any> => {
  try {
    const params: any = { fechaInicio, fechaFin };
    if (veterinariaId) {
      params.veterinariaId = veterinariaId;
    }
    const res = await apiClient.post('/reportes/generar-citas', null, { params });
    return res.data;
  } catch (error) {
    console.error('Error al generar reporte de citas:', error);
    throw error;
  }
};

export const generarReporteMascotasPorVeterinaria = async (veterinariaId?: number): Promise<any> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.post('/reportes/generar-mascotas', null, { params });
    return res.data;
  } catch (error) {
    console.error('Error al generar reporte de mascotas:', error);
    throw error;
  }
};

export const generarReporteUsuariosPorVeterinaria = async (veterinariaId?: number): Promise<any> => {
  try {
    const params = veterinariaId ? { veterinariaId } : {};
    const res = await apiClient.post('/reportes/generar-usuarios', null, { params });
    return res.data;
  } catch (error) {
    console.error('Error al generar reporte de usuarios:', error);
    throw error;
  }
};
