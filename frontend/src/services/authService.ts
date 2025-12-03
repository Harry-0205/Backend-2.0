import apiClient from './apiClient';
import { LoginRequest, SignupRequest, JwtResponse } from '../types';

class AuthService {
  login(loginRequest: LoginRequest): Promise<JwtResponse> {
    console.log('🔑 Intentando login con:', loginRequest);
    return apiClient
      .post('/auth/signin', loginRequest)
      .then(response => {
        console.log('✅ Respuesta del servidor:', response.data);
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
          console.log('💾 Usuario guardado en localStorage');
        } else {
          console.warn('⚠️ No se recibió token en la respuesta');
        }
        return response.data;
      })
      .catch(error => {
        console.error('❌ Login failed:', error);
        throw error;
      });
  }

  register(signupRequest: SignupRequest): Promise<any> {
    return apiClient.post('/auth/signup', signupRequest);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser(): JwtResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(`ROLE_${role}`) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVeterinario(): boolean {
    return this.hasRole('VETERINARIO');
  }

  isRecepcionista(): boolean {
    return this.hasRole('RECEPCIONISTA');
  }

  isCliente(): boolean {
    return this.hasRole('CLIENTE');
  }

  updateCurrentUser(updatedData: any): void {
    const user = this.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('💾 Usuario actualizado en localStorage:', updatedUser);
    }
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;