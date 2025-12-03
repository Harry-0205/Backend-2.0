# 🔧 Configuración del Proyecto - App Móvil Veterinaria

## 📋 Requisitos Previos

- Node.js 16+
- Expo CLI
- Dispositivo móvil o emulador con Expo Go
- Backend corriendo en tu red local

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

#### Opción A: Copiar archivo de ejemplo
```bash
# En Windows (CMD)
copy .env.example .env

# En Mac/Linux
cp .env.example .env
```

#### Opción B: Crear archivo manualmente
Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:8080/api
EXPO_PUBLIC_API_TIMEOUT=10000
EXPO_PUBLIC_DEBUG=true
```

### 3. Encontrar tu IP Local

#### Windows:
```cmd
ipconfig
```
Busca **"Dirección IPv4"** en la sección de tu adaptador de red WiFi/Ethernet.
Ejemplo: `192.168.1.100`

#### Mac/Linux:
```bash
ifconfig
# o
ip addr show
```
Busca **"inet"** en tu interfaz de red activa (generalmente `en0` o `wlan0`).

#### Ejemplo de IP válida:
- ✅ `192.168.1.100` (Red WiFi local)
- ✅ `10.0.0.50` (Red privada)
- ✅ `172.16.0.10` (Red corporativa)
- ❌ `127.0.0.1` (Localhost - NO funciona en móvil)

### 4. Actualizar el archivo .env

Edita el archivo `.env` y reemplaza `TU_IP_LOCAL` con tu IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080/api
```

## 🚀 Ejecutar la Aplicación

### Modo Desarrollo (Con Expo Go)

```bash
npx expo start
```

Luego:
1. Escanea el QR con la app **Expo Go** (iOS/Android)
2. Asegúrate de que tu móvil esté en la **misma red WiFi** que tu computadora

### Opciones de Ejecución

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (para testing)
npx expo start --web

# Limpiar caché
npx expo start -c
```

## 🔍 Verificación

Al iniciar la app, deberías ver en los logs:

```
🔧 Configuración de API:
   URL Base: http://192.168.1.100:8080/api
   Timeout: 10000 ms
```

## ⚠️ Solución de Problemas

### Error: "Network Error" o "Request failed"

**Causa:** El móvil no puede conectarse al backend.

**Soluciones:**
1. ✅ Verifica que el backend esté corriendo (`http://localhost:8080`)
2. ✅ Confirma que el móvil esté en la **misma red WiFi**
3. ✅ Verifica que la IP en `.env` sea correcta
4. ✅ Desactiva el firewall temporalmente (Windows)
5. ✅ Reinicia el servidor Expo (`r` en terminal)

### Error: "Cannot find name 'process'"

**Causa:** Expo no encuentra las variables de entorno.

**Solución:**
```bash
# Reinicia el servidor con caché limpia
npx expo start -c
```

### La IP cambió después de reiniciar

**Causa:** El router asignó una IP diferente (DHCP).

**Soluciones:**
1. **Opción Temporal:** Actualiza `.env` con la nueva IP
2. **Opción Permanente:** Configura IP estática en tu computadora

#### Configurar IP Estática (Windows):
1. Panel de Control → Redes e Internet → Centro de redes
2. Click derecho en tu conexión → Propiedades
3. IPv4 → Propiedades → Usar la siguiente dirección IP
4. Ingresa una IP fija (ej: `192.168.1.100`)

## 📱 Usuarios de Prueba

```
👤 Admin:
   Usuario: admin
   Contraseña: admin123

👨‍⚕️ Veterinarios:
   Usuario: dr.garcia | Contraseña: admin123
   Usuario: dra.martinez | Contraseña: admin123

👥 Clientes:
   Usuario: cliente1 | Contraseña: admin123
   Usuario: cliente2 | Contraseña: admin123

📋 Recepcionista:
   Usuario: recepcion1 | Contraseña: admin123
```

## 🔐 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio
- ✅ El archivo `.env.example` es seguro para compartir
- ✅ Usa `.env` solo para desarrollo local
- ⚠️ Para producción, usa variables de entorno del servidor

## 📝 Cambiar de Computadora

Cuando trabajes en otro equipo:

1. Clona el repositorio
2. Copia `.env.example` a `.env`
3. Encuentra la IP de la nueva computadora
4. Actualiza `EXPO_PUBLIC_API_URL` en `.env`
5. Ejecuta `npx expo start`

## 🌐 Variables de Entorno Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | URL base del backend | `http://192.168.1.100:8080/api` |
| `EXPO_PUBLIC_API_TIMEOUT` | Timeout en milisegundos | `10000` |
| `EXPO_PUBLIC_DEBUG` | Habilitar logs debug | `true` o `false` |

## 🤝 Colaboración

Cuando compartas el proyecto con otros desarrolladores:

1. Comparte el archivo `.env.example`
2. Cada desarrollador debe crear su propio `.env`
3. Cada uno usa su propia IP local

---

**Última actualización:** 26 de noviembre de 2025
