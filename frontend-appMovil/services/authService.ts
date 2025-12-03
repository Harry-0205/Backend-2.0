import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  roles: string[];
  veterinaria?: {
    id: number;
    nombre: string;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Intentando login con:', credentials.username);
      const response = await apiClient.post<LoginResponse>('/auth/signin', credentials);
      
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
      
      console.log('✅ Login exitoso:', response.data.username);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('currentUser');
    console.log('👋 Sesión cerrada');
  }

  async getCurrentUser(): Promise<LoginResponse | null> {
    const userStr = await AsyncStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  }

  async isVeterinario(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.roles?.includes('ROLE_VETERINARIO') || false;
  }

  async isRecepcionista(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.roles?.includes('ROLE_RECEPCIONISTA') || false;
  }

  async isCliente(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.roles?.includes('ROLE_CLIENTE') || false;
  }

  async hasRole(role: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.roles?.includes(`ROLE_${role}`) || user?.roles?.includes(role) || false;
  }
}

export default new AuthService();
