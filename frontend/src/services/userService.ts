import apiClient from './apiClient';
import { Usuario } from '../types';

export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    const res = await apiClient.get('/usuarios');
    
    // Si es string, parsearlo
    let data = res.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

export const getVeterinarios = async (): Promise<Usuario[]> => {
  try {
    console.log('🚀 Llamando endpoint: /usuarios/veterinarios');
    const res = await apiClient.get('/usuarios/veterinarios');
    console.log('📥 Respuesta recibida:', res);
    
    // Si es string, parsearlo
    let data = res.data;
    if (typeof data === 'string') {
      console.log('🔄 Parseando respuesta string...');
      data = JSON.parse(data);
    }
    
    console.log('✅ Datos procesados:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al obtener veterinarios:', error);
    console.log('🔄 Intentando endpoint público como respaldo...');
    
    // Intentar endpoint público como respaldo
    try {
      const resPublic = await apiClient.get('/usuarios/veterinarios/public');
      console.log('📥 Respuesta pública recibida:', resPublic);
      
      let dataPublic = resPublic.data;
      if (typeof dataPublic === 'string') {
        dataPublic = JSON.parse(dataPublic);
      }
      
      console.log('✅ Datos públicos procesados:', dataPublic);
      return Array.isArray(dataPublic) ? dataPublic : [];
    } catch (publicError) {
      console.error('❌ Error también en endpoint público:', publicError);
      return [];
    }
  }
};

export const getVeterinariosByVeterinaria = async (veterinariaId: number): Promise<Usuario[]> => {
  try {
    console.log('🚀 Llamando endpoint: /usuarios/veterinarios/por-veterinaria/' + veterinariaId);
    const res = await apiClient.get(`/usuarios/veterinarios/por-veterinaria/${veterinariaId}`);
    console.log('📥 Respuesta recibida:', res);
    
    // Si es string, parsearlo
    let data = res.data;
    if (typeof data === 'string') {
      console.log('🔄 Parseando respuesta string...');
      data = JSON.parse(data);
    }
    
    console.log('✅ Veterinarios por veterinaria procesados:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al obtener veterinarios por veterinaria:', error);
    return [];
  }
};

export const createUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const res = await apiClient.post('/usuarios', usuario);
  return res.data;
};

export const updateUsuario = async (documento: string, usuario: Usuario): Promise<Usuario> => {
  const res = await apiClient.put(`/usuarios/${documento}`, usuario);
  return res.data;
};

export const deleteUsuario = async (documento: string): Promise<void> => {
  await apiClient.delete(`/usuarios/${documento}`);
};

export const deactivateUsuario = async (documento: string): Promise<void> => {
  await apiClient.patch(`/usuarios/${documento}/desactivar`);
};

export const activateUsuario = async (documento: string): Promise<void> => {
  await apiClient.patch(`/usuarios/${documento}/activar`);
};