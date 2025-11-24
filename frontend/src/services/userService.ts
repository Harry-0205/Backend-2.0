import apiClient from './apiClient';
import { Usuario } from '../types';

export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    const res = await apiClient.get('/usuarios');
    console.log('📥 Respuesta getAllUsuarios:', res.data);
    
    // El backend devuelve ApiResponse<List<UsuarioResponse>>
    // Estructura: { success: boolean, message: string, data: Usuario[], timestamp: string }
    let responseData = res.data;
    
    // Si es string, parsearlo
    if (typeof responseData === 'string') {
      responseData = JSON.parse(responseData);
    }
    
    // Extraer el campo 'data' de la respuesta ApiResponse
    const usuarios = responseData.data || responseData;
    console.log('✅ Usuarios extraídos:', usuarios);
    
    return Array.isArray(usuarios) ? usuarios : [];
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
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
  console.log('📤 Creando usuario con datos:', usuario);
  try {
    const res = await apiClient.post('/usuarios', usuario);
    console.log('✅ Usuario creado:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error detallado al crear usuario:', error);
    console.error('❌ Respuesta del servidor:', error.response?.data);
    console.error('❌ Status:', error.response?.status);
    throw error;
  }
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