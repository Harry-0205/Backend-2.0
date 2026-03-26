import axios from 'axios';

// Usar URL completa directamente
const API_BASE_URL = 'http://98.90.180.72:8080/api';

// Función para obtener el token sin importación circular
const getAuthToken = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user ? user.token : null;
  }
  return null;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Cambiar a false para evitar problemas CORS
  timeout: 30000,
});

// Interceptor para añadir el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Logging removido por seguridad
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    // Logging removido por seguridad
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });
    
    // Verificar si el usuario está desactivado
    const errorMessage = error.response?.data?.message || error.response?.data || '';
    const isDeactivatedUser = typeof errorMessage === 'string' && 
                             (errorMessage.toLowerCase().includes('desactivado') || 
                              errorMessage.toLowerCase().includes('no se permite el acceso'));
    
    if (isDeactivatedUser) {
      console.warn('🚫 Usuario desactivado detectado, cerrando sesión...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      alert('Tu cuenta ha sido desactivada. No se permite el acceso a la plataforma.');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Solo cerrar sesión si es un error 401 Y el mensaje indica claramente un problema de token
    if (error.response?.status === 401) {
      const errorMsg = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
      const isTokenError = errorMsg.includes('token') || 
                          errorMsg.includes('expired') || 
                          errorMsg.includes('invalid') ||
                          errorMsg.includes('malformed') ||
                          errorMsg.includes('unauthorized');
      
      // También verificar si es la ruta de login que falló
      const isLoginFailure = error.config?.url?.includes('/auth/signin');
      
      if (isTokenError && !isLoginFailure) {
        console.warn('🔐 Token expirado o inválido, cerrando sesión...');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.warn('⚠️ Error 401 - No se cerrará la sesión automáticamente');
      }
    }
    
    // Para errores 403, solo registrar pero no cerrar sesión
    if (error.response?.status === 403) {
      console.warn('⚠️ Error 403 - Acceso denegado. El usuario no tiene permisos suficientes.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;