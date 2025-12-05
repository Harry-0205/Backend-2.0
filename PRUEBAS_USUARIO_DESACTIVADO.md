# 🧪 PRUEBAS - VALIDACIÓN USUARIO DESACTIVADO

## ⚠️ IMPORTANTE: Verificación Previa

Antes de probar, debemos asegurarnos de que el usuario esté realmente desactivado en la base de datos.

---

## 📋 Paso 1: Verificar Estado del Usuario en la Base de Datos

### Ejecutar en MySQL:

```sql
USE veterinaria;

-- Ver estado del usuario dr.rodriguez (o el que uses para prueba)
SELECT 
    username,
    activo,
    CONCAT(nombres, ' ', apellidos) as nombre_completo
FROM usuarios
WHERE username = 'dr.rodriguez';
```

**Resultado esperado:**
- Si `activo = 1` → Usuario está ACTIVO (debes desactivarlo para probar)
- Si `activo = 0` → Usuario está DESACTIVADO (correcto para la prueba)
- Si `activo = NULL` → Hay un problema con la base de datos

---

## 📋 Paso 2: Desactivar Usuario para Pruebas

### Ejecutar en MySQL:

```sql
USE veterinaria;

-- DESACTIVAR el usuario
UPDATE usuarios 
SET activo = FALSE 
WHERE username = 'dr.rodriguez';

-- VERIFICAR que el cambio se aplicó
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
-- Debe mostrar: activo = 0
```

---

## 📋 Paso 3: Reiniciar el Backend

Es **MUY IMPORTANTE** reiniciar el servidor backend después de los cambios en el código:

### Windows (CMD):
```cmd
cd c:\xampp\htdocs\Backend-2.0\backend
mvnw.cmd spring-boot:run
```

### O detener y volver a iniciar el servidor si está corriendo en tu IDE

---

## 📋 Paso 4: Probar Login con Usuario Desactivado

### Frontend Web:

1. Abrir el navegador en: `http://localhost:3000/login`
2. Ingresar credenciales del usuario desactivado:
   - **Usuario:** `dr.rodriguez`
   - **Contraseña:** `admin123`
3. Click en "Iniciar Sesión"

### ✅ Comportamiento Esperado:

- ❌ El login debe ser **rechazado**
- 📢 Debe aparecer un mensaje de error rojo
- 📝 El mensaje debe decir: **"🚫 Tu cuenta ha sido desactivada. No se permite el acceso a la plataforma."**
- 🚫 NO debe redirigir al dashboard
- 🚫 NO debe guardarse ningún token en localStorage

### 🔍 Verificar en la Consola del Navegador (F12):

Debe mostrar logs como:
```
💥 Error en handleSubmit: [Error details]
💥 Error response: {...}
💥 Error response data: {...}
💬 Mensaje de error extraído: Usuario desactivado. No se permite el acceso a la plataforma.
```

---

## 📋 Paso 5: Verificar en el Backend

### Revisar logs del servidor backend:

Debe aparecer algo como:
```
ERROR - Usuario desactivado intentó acceder: Usuario desactivado. No se permite el acceso a la plataforma.
```

---

## 📋 Paso 6: Probar con Usuario Activo

Para confirmar que el sistema funciona correctamente:

```sql
-- Activar nuevamente el usuario
UPDATE usuarios 
SET activo = TRUE 
WHERE username = 'dr.rodriguez';
```

Luego intentar login nuevamente:

### ✅ Comportamiento Esperado:
- ✅ Login debe ser **exitoso**
- ✅ Redirección al dashboard
- ✅ Token guardado en localStorage
- ✅ Mensaje de bienvenida en el dashboard

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Usuario desactivado pero sigue entrando"

**Posibles causas:**
1. El campo `activo` en la BD sigue siendo `1` (TRUE)
2. El backend no se reinició después de los cambios
3. Hay un token antiguo en localStorage

**Soluciones:**
```sql
-- Verificar en BD
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';

-- Si activo = 1, ejecutar:
UPDATE usuarios SET activo = 0 WHERE username = 'dr.rodriguez';
```

Luego:
1. Reiniciar el backend completamente
2. Limpiar localStorage del navegador (F12 → Application → Local Storage → Clear)
3. Intentar login nuevamente

---

### Problema 2: "No aparece el mensaje de error"

**Verificar:**
1. Abrir consola del navegador (F12)
2. Ver si hay errores en la consola
3. Verificar que el mensaje del backend esté llegando correctamente

**En el backend, verificar que GlobalExceptionHandler esté activo:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<ApiResponse<Object>> handleDisabledException(...) {
        // Este método debe estar presente
    }
}
```

---

### Problema 3: "Error 500 en lugar de mensaje claro"

**Causa:** El backend está lanzando una excepción no manejada

**Solución:**
1. Revisar logs del backend
2. Verificar que todos los imports están correctos
3. Asegurarse de que `DisabledException` sea de Spring Security:
   ```java
   import org.springframework.security.authentication.DisabledException;
   ```

---

## 🧪 Pruebas Adicionales

### Prueba A: Usuario Activo Desactivado Durante Sesión

1. Login con usuario activo (`cliente1`, password: `admin123`)
2. Una vez en el dashboard, ejecutar en MySQL:
   ```sql
   UPDATE usuarios SET activo = FALSE WHERE username = 'cliente1';
   ```
3. Intentar hacer alguna acción (listar mascotas, crear cita, etc.)

**Resultado esperado:**
- Debe cerrar sesión automáticamente
- Debe mostrar alerta
- Debe redirigir a login

---

### Prueba B: Múltiples Usuarios

```sql
-- Desactivar varios usuarios
UPDATE usuarios SET activo = FALSE WHERE username IN ('cliente1', 'cliente2');

-- Verificar
SELECT username, activo FROM usuarios WHERE username IN ('cliente1', 'cliente2');
```

Probar login con cada uno y verificar que todos sean rechazados.

---

## 📊 Checklist de Validación

- [ ] Usuario desactivado en BD (activo = 0)
- [ ] Backend reiniciado después de cambios
- [ ] localStorage limpio en el navegador
- [ ] Login rechazado con mensaje correcto
- [ ] No se genera token JWT
- [ ] No hay redirección al dashboard
- [ ] Logs del backend muestran rechazo
- [ ] Usuario activo puede iniciar sesión normalmente
- [ ] Usuario desactivado durante sesión es expulsado

---

## 🔄 Reactivar Usuarios para Uso Normal

```sql
USE veterinaria;

-- Reactivar todos los usuarios de prueba
UPDATE usuarios 
SET activo = TRUE 
WHERE username IN ('dr.rodriguez', 'cliente1', 'cliente2', 'cliente3');

-- Verificar
SELECT username, activo, CONCAT(nombres, ' ', apellidos) as nombre
FROM usuarios
WHERE username IN ('dr.rodriguez', 'cliente1', 'cliente2', 'cliente3');
```

---

## 📞 Contacto para Soporte

Si después de seguir estos pasos el problema persiste:

1. Captura los logs del backend
2. Captura los logs de la consola del navegador
3. Captura el resultado de:
   ```sql
   SELECT username, activo FROM usuarios WHERE username = 'TU_USUARIO';
   ```
4. Verifica que los archivos modificados tengan los cambios correctos

---

**Última actualización:** 5 de diciembre de 2025
**Estado:** ✅ Implementación corregida con DisabledException
