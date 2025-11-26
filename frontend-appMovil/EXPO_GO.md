# 📱 Desplegar con Expo Go

Guía para ejecutar la app en tu celular usando Expo Go.

## 📋 Requisitos

1. **Node.js** instalado (v16+)
2. **Expo Go** app en tu celular:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)
3. Tu PC y celular en la **misma red WiFi**

## 🚀 Pasos de Instalación

### 1. Instalar Dependencias

```bash
cd c:\xampp\htdocs\Backend-2.0\frontend-appMovil
npm install
```

### 2. Configurar la IP del Backend

Edita `services/apiClient.ts` y cambia la IP por la de tu PC:

```typescript
// Encuentra tu IP ejecutando: ipconfig (Windows)
const API_BASE_URL = 'http://TU_IP_AQUI:8080/api';
// Ejemplo: 'http://192.168.1.5:8080/api'
```

Para encontrar tu IP en Windows:
```bash
ipconfig
```
Busca "Dirección IPv4" de tu red WiFi.

### 3. Actualizar CORS en el Backend

Agrega tu IP al archivo `backend/src/main/resources/application.properties`:

```properties
app.cors.allowed-origins=http://localhost:3000,http://TU_IP:3001
```

**Reinicia el servidor Spring Boot** después de este cambio.

### 4. Iniciar Expo

```bash
npm start
```

Verás un código QR en la terminal.

### 5. Escanear el Código QR

**En Android:**
- Abre la app **Expo Go**
- Toca "Scan QR code"
- Escanea el código

**En iOS:**
- Abre la app **Cámara** nativa
- Apunta al código QR
- Toca la notificación que aparece
- Se abrirá en Expo Go

## ✅ Verificación

1. La app debería cargarse en tu celular
2. Verás la pantalla de Login
3. Prueba con: `admin` / `admin123`

## 🔧 Solución de Problemas

### No se conecta al backend

1. Verifica que tu PC y celular estén en la **misma WiFi**
2. Verifica la IP en `apiClient.ts`
3. Desactiva el **Firewall de Windows** temporalmente
4. Verifica que el backend esté corriendo en puerto 8080

### Error al escanear QR

1. Usa el modo **tunnel** en lugar de LAN:
   ```bash
   expo start --tunnel
   ```
2. Esto es más lento pero funciona si LAN falla

### La app se cierra al abrir

1. Revisa los errores en la consola de Expo
2. Sacude el celular para abrir el menú de desarrollador
3. Toca "Reload" para reiniciar

## 📱 Usuarios de Prueba

- **Admin**: admin / admin123
- **Veterinario**: drsmith / vet123
- **Cliente**: cliente1 / cliente123

## 🎯 Comandos Útiles

```bash
# Iniciar en modo normal
npm start

# Iniciar con túnel (más compatible)
expo start --tunnel

# Limpiar caché
expo start -c

# Ver logs detallados
npm start -- --verbose
```

## 📊 Características de la App

✅ Login con JWT  
✅ Dashboard con estadísticas  
✅ Pull-to-refresh  
✅ Menú lateral  
✅ Diseño nativo iOS/Android  
✅ Conexión al backend existente

## 🌐 Para Producción

Si quieres generar un APK/IPA:

```bash
# Configurar cuenta Expo (gratis)
npx expo login

# Build para Android
eas build --platform android

# Build para iOS (requiere Mac)
eas build --platform ios
```

---

**¿Problemas?** Revisa que:
1. Backend esté corriendo
2. IP esté correcta
3. CORS esté configurado
4. Firewall permita conexiones
