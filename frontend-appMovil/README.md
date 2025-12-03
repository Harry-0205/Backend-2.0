# 🐾 Pet-History - App Móvil

Aplicación móvil para el sistema de gestión veterinaria, construida con React Native y Expo Go.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar IP del Backend

**IMPORTANTE**: Debes cambiar la IP en `services/apiClient.ts`

```typescript
// Encuentra tu IP con: ipconfig (Windows)
const API_BASE_URL = 'http://192.168.X.X:8080/api';
```

### 3. Actualizar CORS en Backend

En `backend/src/main/resources/application.properties`:

```properties
app.cors.allowed-origins=http://localhost:3000,http://TU_IP:3001
```

**Reinicia el servidor Spring Boot.**

### 4. Ejecutar con Expo Go

```bash
npm start
```

Escanea el QR con:
- **Android**: App Expo Go
- **iOS**: App Cámara nativa

## 📱 Requisitos

- Node.js 16+
- Expo Go instalado en tu celular
- Backend corriendo en puerto 8080
- PC y celular en la **misma red WiFi**

## 👥 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| drsmith | vet123 | Veterinario |
| cliente1 | cliente123 | Cliente |

## 🔧 Comandos

```bash
npm start              # Iniciar Expo
npm start -- --tunnel  # Modo túnel (más compatible)
expo start -c          # Limpiar caché
```

## 📦 Estructura

```
frontend-appMovil/
├── App.tsx              # Navegación principal
├── app.json             # Configuración Expo
├── package.json         # Dependencias
├── screens/             # Pantallas
│   ├── LoginScreen.tsx
│   └── DashboardScreen.tsx
├── services/            # API
│   ├── apiClient.ts
│   └── authService.ts
└── assets/              # Imágenes/íconos
```

## 🎯 Funcionalidades

- ✅ Login con JWT
- ✅ Dashboard con estadísticas
- ✅ Pull-to-refresh
- ✅ Menú lateral
- ✅ Diseño nativo React Native
- ✅ Soporte iOS y Android

## 📖 Documentación

Lee `EXPO_GO.md` para guía detallada de despliegue.

## 🐛 Solución de Problemas

### No conecta al backend
1. Verifica que ambos estén en misma WiFi
2. Confirma la IP en `apiClient.ts`
3. Desactiva firewall temporalmente
4. Verifica que backend esté en puerto 8080

### QR no funciona
```bash
expo start --tunnel
```

## 🔧 Tecnologías

- React Native 0.72.6
- Expo ~49.0.15
- TypeScript
- Webpack
- Axios (para API)
- CSS3 con animaciones

## 🎨 Diseño

- Optimizado para pantallas móviles
- Interfaz táctil intuitiva
- Gradientes modernos
- Iconos emoji para mayor compatibilidad
- Soporte para tema oscuro automático

## 📡 Conexión al Backend

La app se conecta automáticamente al backend en `http://localhost:8080/api`

Endpoints utilizados:
- `/auth/login` - Autenticación
- `/mascotas` - Gestión de mascotas
- `/citas` - Gestión de citas
- `/historias-clinicas` - Historias clínicas

## 👤 Usuarios de Prueba

Usa los mismos usuarios del sistema principal:
- **Admin**: admin / admin123
- **Veterinario**: drsmith / vet123
- **Cliente**: cliente1 / cliente123

## 📦 Estructura del Proyecto

```
frontend-appMovil/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Login.css
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   └── dashboardService.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 🔐 Seguridad

- Token JWT almacenado en localStorage
- Interceptores Axios para manejo automático de autenticación
- Redirección automática en caso de sesión expirada
- Validación de roles en frontend
