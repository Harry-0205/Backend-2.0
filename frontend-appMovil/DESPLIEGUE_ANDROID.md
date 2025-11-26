# 📱 Despliegue en Android Studio

Guía paso a paso para desplegar la aplicación Pet-History en Android Studio.

## 📋 Requisitos Previos

1. **Node.js** (v16 o superior)
2. **Android Studio** instalado
3. **JDK 17** (Java Development Kit)
4. **Android SDK** (se instala con Android Studio)
5. **Gradle** (se instala automáticamente)

### Configurar Variables de Entorno

```bash
# Windows
ANDROID_HOME=C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

# Agregar al PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

## 🚀 Pasos de Instalación

### 1. Instalar Dependencias

```bash
cd c:\xampp\htdocs\Backend-2.0\frontend-appMovil
npm install
```

### 2. Construir la Aplicación Web

```bash
npm run build
```

Esto generará los archivos optimizados en la carpeta `dist/`

### 3. Inicializar Capacitor

```bash
npx cap init
```

Cuando te pregunte:
- **App name**: Pet-History
- **App ID**: com.veterinaria.app
- **Web directory**: dist

### 4. Agregar Plataforma Android

```bash
npx cap add android
```

Esto creará la carpeta `android/` con todo el proyecto de Android Studio.

### 5. Sincronizar Cambios

```bash
npx cap sync
```

### 6. Abrir en Android Studio

```bash
npx cap open android
```

O manualmente:
1. Abre Android Studio
2. File → Open
3. Navega a: `c:\xampp\htdocs\Backend-2.0\frontend-appMovil\android`
4. Espera a que Gradle sincronice

## 📱 Ejecutar en Emulador o Dispositivo

### Opción A: Desde Android Studio

1. En Android Studio, selecciona un emulador o dispositivo conectado
2. Haz clic en el botón verde ▶️ **Run**
3. La app se instalará y ejecutará automáticamente

### Opción B: Desde Terminal

```bash
npm run android
```

## 🔧 Configuración de Red para Backend Local

Como el backend está en `localhost:8080`, necesitas configuración especial:

### Para Emulador Android:

Usa `10.0.2.2` en lugar de `localhost`:

```typescript
// src/services/apiClient.ts
const API_BASE_URL = 'http://10.0.2.2:8080/api';
```

### Para Dispositivo Físico:

Usa la IP de tu computadora en la red local:

```typescript
// Encuentra tu IP con: ipconfig (Windows)
const API_BASE_URL = 'http://192.168.X.X:8080/api';
```

También necesitas actualizar CORS en el backend:

```properties
# backend/src/main/resources/application.properties
app.cors.allowed-origins=http://localhost:3000,http://10.0.2.2:3001,http://192.168.X.X:3001
```

## 🔄 Workflow de Desarrollo

Cada vez que hagas cambios en el código:

```bash
# 1. Construir la app web
npm run build

# 2. Sincronizar con Android
npx cap sync

# 3. Ejecutar
npm run android
```

O usa el script combinado:

```bash
npm run android:build
```

## 📦 Generar APK para Distribución

### 1. Build de Producción

```bash
npm run build
npx cap sync
```

### 2. En Android Studio

1. Build → Generate Signed Bundle / APK
2. Selecciona **APK**
3. Crea un nuevo Keystore o usa uno existente
4. Completa los datos del certificado
5. Selecciona **release**
6. Espera a que se genere

El APK estará en: `android/app/release/app-release.apk`

### 3. Desde Terminal (Alternativa)

```bash
cd android
./gradlew assembleRelease
```

## 🐛 Solución de Problemas Comunes

### Error: SDK not found

```bash
# Verifica ANDROID_HOME
echo %ANDROID_HOME%

# Debe mostrar: C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

### Error: Gradle sync failed

1. File → Invalidate Caches → Invalidate and Restart
2. Tools → SDK Manager → Verifica que Android 33+ esté instalado
3. Limpia el proyecto: Build → Clean Project

### Error: Cannot connect to backend

- Verifica que el backend esté corriendo en puerto 8080
- Usa `10.0.2.2` para emulador
- Usa IP de red local para dispositivo físico
- Desactiva firewall temporalmente para pruebas

### App se cierra al abrir

Revisa los logs en Android Studio:
- View → Tool Windows → Logcat
- Filtra por tu package: com.veterinaria.app

## 📱 Probar en Dispositivo Real

1. Activa **Opciones de Desarrollador** en tu Android:
   - Configuración → Acerca del teléfono
   - Toca 7 veces en "Número de compilación"

2. Activa **Depuración USB**:
   - Opciones de desarrollador → Depuración USB

3. Conecta el dispositivo con cable USB

4. Autoriza la depuración en el teléfono

5. En Android Studio, selecciona tu dispositivo y ejecuta

## 🎯 Recursos Adicionales

- [Documentación Capacitor](https://capacitorjs.com/docs)
- [Guía Android Studio](https://developer.android.com/studio/intro)
- [Configurar Emulador Android](https://developer.android.com/studio/run/emulator)
