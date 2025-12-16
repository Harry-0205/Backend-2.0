import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Leer la URL del API desde variables de entorno
// Si no está definida, usar un valor por defecto
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.25:8080/api';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10);
const DEBUG_ENABLED = process.env.EXPO_PUBLIC_DEBUG === 'true';

// Mostrar configuración al iniciar (solo en desarrollo)
if (__DEV__ && DEBUG_ENABLED) {
  console.log('🔧 Configuración de API:');
  console.log('   URL Base:', API_BASE_URL);
  console.log('   Timeout:', API_TIMEOUT, 'ms');
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    // Interceptor para agregar token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (DEBUG_ENABLED) {
          console.log('📤 Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => {
        if (DEBUG_ENABLED) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (DEBUG_ENABLED) {
          console.log('✅ Response:', response.status, response.config.url);
        }
        return response;
      },
      async (error) => {
        if (DEBUG_ENABLED) {
          console.error('❌ Response Error:', error.response?.status, error.response?.data);
        }
        
        // Verificar si el usuario está desactivado
        const errorMessage = error.response?.data?.message || error.response?.data || '';
        const isDeactivatedUser = typeof errorMessage === 'string' && 
                                 (errorMessage.toLowerCase().includes('desactivado') || 
                                  errorMessage.toLowerCase().includes('no se permite el acceso'));
        
        if (isDeactivatedUser) {
          console.warn('🚫 Usuario desactivado detectado');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('currentUser');
          // El error se propagará para que el componente de login lo maneje
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('currentUser');
        }
        
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default new ApiClient();
