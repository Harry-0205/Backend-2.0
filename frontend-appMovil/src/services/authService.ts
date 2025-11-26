import apiClient from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
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
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      
      console.log('✅ Login exitoso:', response.data.username);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    console.log('👋 Sesión cerrada');
  }

  getCurrentUser(): LoginResponse | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  }

  isVeterinario(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_VETERINARIO') || false;
  }

  isRecepcionista(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_RECEPCIONISTA') || false;
  }

  isCliente(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_CLIENTE') || false;
  }
}

export default new AuthService();
