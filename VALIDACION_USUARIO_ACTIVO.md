# Validación de Usuario Activo - Implementación Completa

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de validación para usuarios desactivados que impide el acceso a la plataforma tanto en el backend como en el frontend (web y móvil).

---

## 🔧 Cambios en el Backend

### 1. **UserPrincipal.java**
- ✅ Agregado campo `activo` al objeto de seguridad
- ✅ Modificado método `isEnabled()` para usar el estado del usuario
- ✅ Agregado método `isActivo()` para consultas

### 2. **UserDetailsServiceImpl.java**
- ✅ Validación al cargar usuario: lanza excepción si está desactivado
- ✅ Mensaje claro: "Usuario desactivado. No se permite el acceso a la plataforma."

### 3. **AuthService.java**
- ✅ Validación adicional antes de autenticar
- ✅ Verifica estado del usuario antes de generar token JWT
- ✅ Lanza RuntimeException con mensaje descriptivo

### 4. **AuthTokenFilter.java**
- ✅ Intercepta todas las peticiones autenticadas
- ✅ Verifica el estado activo del usuario en cada request
- ✅ Retorna 401 con mensaje JSON si el usuario está desactivado
- ✅ Impide que usuarios desactivados ejecuten acciones

### 5. **Usuario.java (Entity)**
- ✅ Agregado método `isActivo()` para validación booleana primitiva

---

## 💻 Cambios en el Frontend Web

### 1. **Login.tsx**
- ✅ Manejo mejorado de errores de autenticación
- ✅ Detección específica de usuarios desactivados
- ✅ Mensaje personalizado: "🚫 Tu cuenta ha sido desactivada. No se permite el acceso a la plataforma."

### 2. **apiClient.ts**
- ✅ Interceptor de respuestas mejorado
- ✅ Detección automática de usuarios desactivados en cualquier petición
- ✅ Cierre de sesión automático con alerta al usuario
- ✅ Limpieza de localStorage y redirección a login

---

## 📱 Cambios en la App Móvil

### 1. **LoginScreen.tsx**
- ✅ Manejo de errores con Alert nativo
- ✅ Mensaje específico para usuarios desactivados
- ✅ Alert con título "🚫 Acceso Denegado"

### 2. **apiClient.ts (móvil)**
- ✅ Interceptor de respuestas
- ✅ Detección de usuarios desactivados
- ✅ Limpieza de AsyncStorage automática

---

## 🧪 Casos de Prueba

### Prueba 1: Login con usuario desactivado
**Pasos:**
1. Desactivar un usuario desde el panel de administración
2. Intentar iniciar sesión con ese usuario
3. **Resultado esperado:** 
   - Error visible en la pantalla de login
   - Mensaje: "Usuario desactivado. No se permite el acceso a la plataforma."
   - No se genera token JWT
   - No se guarda sesión

### Prueba 2: Usuario activo desactivado durante la sesión
**Pasos:**
1. Usuario A inicia sesión correctamente
2. Administrador desactiva al Usuario A
3. Usuario A intenta realizar cualquier acción (listar mascotas, crear cita, etc.)
4. **Resultado esperado:**
   - Interceptor detecta usuario desactivado
   - Sesión se cierra automáticamente
   - Alert/mensaje informativo
   - Redirección a login
   - Datos de sesión eliminados

### Prueba 3: Usuario desactivado intenta usar token existente
**Pasos:**
1. Usuario tiene token válido guardado
2. Usuario es desactivado por administrador
3. Usuario intenta acceder con el token guardado
4. **Resultado esperado:**
   - AuthTokenFilter rechaza la petición
   - Retorna 401 Unauthorized
   - Mensaje: "Usuario desactivado..."
   - Frontend cierra sesión automáticamente

---

## 🔐 Flujo de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                    INTENTO DE LOGIN                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  AuthService.authenticateUser │
        │  ✓ Busca usuario en BD        │
        │  ✓ Verifica campo 'activo'    │
        └──────────────┬─────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
    ❌ NO ACTIVO          ✅ ACTIVO
            │                     │
            ▼                     ▼
   RuntimeException     Continúa autenticación
   "Usuario              │
    desactivado"         ▼
            │     AuthenticationManager
            │     UserDetailsServiceImpl
            │            │
            │     ┌──────┴──────┐
            │     │             │
            │  Verifica      Verifica
            │  credenciales  activo
            │     │             │
            └─────┴─────────────┘
                       │
                ❌ ERROR 401
                       │
                       ▼
              Frontend captura
                       │
            ┌──────────┴──────────┐
            │                     │
     Mensaje de error      Cierra sesión
     personalizado         si es necesario
```

---

## 🛡️ Protección en Tiempo Real

```
┌─────────────────────────────────────────────────────────────┐
│          USUARIO AUTENTICADO REALIZANDO PETICIÓN             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   AuthTokenFilter             │
        │   ✓ Valida JWT token          │
        │   ✓ Carga UserDetails         │
        │   ✓ Verifica isEnabled()      │
        └──────────────┬─────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
    ❌ DESACTIVADO        ✅ ACTIVO
            │                     │
            ▼                     ▼
    Retorna 401 JSON     Continúa petición
    + mensaje error      al controlador
            │                     │
            ▼                     ▼
    apiClient.interceptor   Ejecuta lógica
            │               de negocio
            ▼
    - Detecta desactivado
    - Muestra alerta
    - Limpia sesión
    - Redirige a login
```

---

## 📝 SQL para Pruebas

### Desactivar un usuario:
```sql
UPDATE usuarios 
SET activo = FALSE 
WHERE username = 'cliente1';
```

### Verificar estado de usuarios:
```sql
SELECT documento, username, nombres, apellidos, activo 
FROM usuarios;
```

### Reactivar un usuario:
```sql
UPDATE usuarios 
SET activo = TRUE 
WHERE username = 'cliente1';
```

---

## ✅ Checklist de Implementación

- [x] Backend valida usuario activo en login
- [x] Backend valida usuario activo en cada petición
- [x] Frontend web maneja error de login
- [x] Frontend web intercepta desactivación en tiempo real
- [x] App móvil maneja error de login
- [x] App móvil intercepta desactivación en tiempo real
- [x] Mensajes de error consistentes
- [x] Limpieza de sesión automática
- [x] Redirección a login automática

---

## 🎯 Comportamiento Final

### Escenario 1: Login Fallido
**Usuario desactivado intenta iniciar sesión**
- ❌ Credenciales rechazadas
- 📢 Mensaje: "Usuario desactivado. No se permite el acceso a la plataforma."
- 🔒 No se genera token
- 🚫 No se guarda sesión

### Escenario 2: Sesión Activa Revocada
**Usuario activo es desactivado mientras usa el sistema**
- 🔍 Siguiente petición detecta desactivación
- 🚨 Alert/notificación al usuario
- 🗑️ Sesión eliminada automáticamente
- ↩️ Redirección a login
- 🔐 No puede ejecutar más acciones

### Escenario 3: Intento de Acceso con Token Antiguo
**Usuario con token guardado pero desactivado**
- 🛡️ AuthTokenFilter intercepta
- ❌ Petición rechazada con 401
- 📱 Frontend detecta y cierra sesión
- 🔄 Usuario debe volver a login (donde será rechazado)

---

## 🔍 Logs para Debugging

El sistema generará estos logs:

**Backend:**
```
ERROR - Usuario desactivado intentó acceder: cliente1
ERROR - Token validation failed: Usuario desactivado. No se permite el acceso a la plataforma.
```

**Frontend:**
```
💥 Error en handleSubmit: [Error details]
🚫 Usuario desactivado detectado, cerrando sesión...
```

---

## 📞 Soporte

Para cualquier problema o duda sobre la implementación, revisar:
1. Logs del backend en consola
2. Consola del navegador (Frontend web)
3. Consola de React Native (App móvil)
4. Estado del campo `activo` en la base de datos

---

**Fecha de implementación:** 5 de diciembre de 2025
**Estado:** ✅ Completado y listo para pruebas
