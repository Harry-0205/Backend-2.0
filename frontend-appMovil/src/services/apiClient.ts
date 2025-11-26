import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Para emulador Android usa 10.0.2.2
// Para dispositivo físico usa la IP de tu PC en la red local (ej: 192.168.1.X)
// Para web usa localhost
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api'
  : 'http://10.0.2.2:8080/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Interceptor para agregar el token JWT a cada request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        
        // Si el token expiró o es inválido, redirigir al login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          window.location.href = '/';
        }
        
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default new ApiClient();
