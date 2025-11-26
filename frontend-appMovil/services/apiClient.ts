import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP de tu computadora en la red local (encontrada con ipconfig)
const API_BASE_URL = 'http://172.16.103.201:8080/api';

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

    // Interceptor para agregar token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
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
      (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        
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

  public delete<T = any>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default new ApiClient();
