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