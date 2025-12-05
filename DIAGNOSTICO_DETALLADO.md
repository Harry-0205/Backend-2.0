# 🔴 DIAGNÓSTICO PASO A PASO - USUARIO DESACTIVADO

## ⚠️ SEGUIR EN ESTE ORDEN EXACTO

---

## PASO 1: Verificar Base de Datos (MUY IMPORTANTE)

### Abrir MySQL y ejecutar:

```sql
USE veterinaria;

SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
```

### ¿Qué muestra?

- **Si muestra `activo = 1`** → El usuario está ACTIVO, debes desactivarlo
- **Si muestra `activo = 0`** → El usuario está DESACTIVADO ✓ (correcto)
- **Si muestra `activo = NULL`** → HAY UN PROBLEMA EN LA BASE DE DATOS

### Si activo = 1, ejecutar:

```sql
UPDATE usuarios SET activo = 0 WHERE username = 'dr.rodriguez';
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
```

**IMPORTANTE:** Después del UPDATE, debe mostrar `activo = 0`

---

## PASO 2: Detener Completamente el Backend

### En tu terminal/IDE:

1. **Presiona Ctrl+C** si está corriendo en terminal
2. **O detén el servidor** en tu IDE
3. **Espera a que se detenga COMPLETAMENTE**
4. **Verifica que no haya procesos Java corriendo:**

```cmd
tasklist | findstr java
```

Si ves procesos Java de Spring Boot, ciérralos.

---

## PASO 3: Limpiar y Recompilar el Proyecto

### Ejecutar en la carpeta del backend:

```cmd
cd c:\xampp\htdocs\Backend-2.0\backend

mvnw.cmd clean

mvnw.cmd compile
```

**Espera a que termine completamente.** Debe decir "BUILD SUCCESS".

---

## PASO 4: Iniciar el Backend con Logs Visibles

```cmd
cd c:\xampp\htdocs\Backend-2.0\backend

mvnw.cmd spring-boot:run
```

**NO CIERRES ESTA VENTANA.** Necesitamos ver los logs.

**Espera hasta que veas:**
```
Started VeterinariaApplication in X.XXX seconds
```

---

## PASO 5: Limpiar el Navegador

### En el navegador (Chrome/Edge):

1. Presiona **F12** (Abrir DevTools)
2. Ve a la pestaña **Application**
3. En el menú izquierdo → **Local Storage** → Click derecho → **Clear**
4. En el menú izquierdo → **Session Storage** → Click derecho → **Clear**
5. **Cierra completamente el navegador** (todas las ventanas)
6. **Abre el navegador de nuevo**

---

## PASO 6: Intentar Login y Observar Logs

### En el navegador:

1. Ir a: `http://localhost:3000/login`
2. **Abrir DevTools (F12)** → Pestaña **Console**
3. Ingresar:
   - Usuario: `dr.rodriguez`
   - Contraseña: `admin123`
4. Click **Iniciar Sesión**

### 🔍 OBSERVAR LA TERMINAL DEL BACKEND

**Debes ver estos logs:**

```
🔍 UserDetailsServiceImpl: Cargando usuario - dr.rodriguez
🔍 Usuario encontrado: dr.rodriguez - activo=false
❌ UserDetailsServiceImpl: Usuario desactivado - dr.rodriguez
```

O también:

```
❌ ACCESO DENEGADO: Usuario desactivado - dr.rodriguez
```

### 🔍 OBSERVAR LA CONSOLA DEL NAVEGADOR

**Debes ver:**

```
💥 Error en handleSubmit: [Error object]
💥 Error response: {status: 401, ...}
💥 Error response data: {...}
💬 Mensaje de error extraído: Usuario desactivado. No se permite el acceso a la plataforma.
```

---

## ✅ RESULTADO ESPERADO

### En la pantalla de Login:

- ❌ **NO** debe redirigir al dashboard
- 📢 Debe aparecer un mensaje de error rojo
- 📝 El mensaje debe decir: "🚫 Tu cuenta ha sido desactivada..."

### En localStorage (F12 → Application → Local Storage):

- 🚫 **NO** debe haber ningún item `user`
- 🚫 **NO** debe haber ningún item `token`

---

## ❌ SI AÚN ENTRA AL DASHBOARD

### Escenario A: Los logs NO aparecen en el backend

**Problema:** El backend no tiene los cambios o no se recompiló correctamente.

**Solución:**

1. Verificar que estos archivos existen con los cambios:
   - `UserDetailsServiceImpl.java` debe tener los `System.out.println`
   - `AuthService.java` debe tener los `System.err.println`

2. Ejecutar:
```cmd
mvnw.cmd clean install
```

3. Reiniciar el backend

---

### Escenario B: Los logs SÍ aparecen pero dice "activo=true"

**Problema:** El usuario en la base de datos NO está desactivado.

**Solución:**

```sql
-- Forzar desactivación
UPDATE usuarios SET activo = 0 WHERE username = 'dr.rodriguez';

-- Verificar múltiples veces
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';
```

**TODAS** las consultas deben mostrar `activo = 0`.

---

### Escenario C: El backend dice "Usuario desactivado" pero el frontend no muestra error

**Problema:** El error del backend no está llegando al frontend.

**En la consola del navegador (F12), ejecutar:**

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Luego intentar login de nuevo.**

---

## 🔍 INFORMACIÓN DE DEBUG ADICIONAL

### Si nada funciona, ejecutar esto en la consola del navegador:

```javascript
// Ver si hay token guardado
console.log('Token:', localStorage.getItem('user'));

// Ver todas las keys
console.log('LocalStorage keys:', Object.keys(localStorage));

// Limpiar TODO
localStorage.clear();
sessionStorage.clear();
```

### Y en MySQL:

```sql
-- Ver TODOS los datos del usuario
SELECT * FROM usuarios WHERE username = 'dr.rodriguez'\G
```

Copiar el resultado completo.

---

## 📸 CAPTURAS NECESARIAS PARA DEBUG

Si después de seguir TODOS los pasos anteriores aún no funciona, tomar estas capturas:

1. **Captura 1:** Resultado del SELECT en MySQL mostrando `activo = 0`
2. **Captura 2:** Logs de la terminal del backend cuando intentas login
3. **Captura 3:** Consola del navegador (F12) con los errores
4. **Captura 4:** Pantalla de login mostrando si hay o no mensaje de error
5. **Captura 5:** Application → Local Storage mostrando que NO hay `user`

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Marca cada item ANTES de decir que no funciona:

- [ ] Usuario tiene `activo = 0` en la BD (verificado con SELECT)
- [ ] Backend detenido completamente
- [ ] Proyecto limpiado con `mvnw clean`
- [ ] Proyecto recompilado con `mvnw compile`
- [ ] Backend reiniciado con `mvnw spring-boot:run`
- [ ] Logs del backend visibles (no cerré la ventana)
- [ ] LocalStorage limpio (Application → Clear)
- [ ] SessionStorage limpio
- [ ] Navegador cerrado y reabierto completamente
- [ ] Intenté login y vi los logs del backend
- [ ] Los logs del backend muestran "Usuario desactivado"
- [ ] NO hay token en localStorage después del intento

---

## 📞 SI NADA FUNCIONA

Ejecutar estos comandos y enviar el resultado:

```sql
-- En MySQL
SELECT username, activo, nombres, apellidos 
FROM usuarios 
WHERE username = 'dr.rodriguez';
```

```cmd
REM En CMD (Windows)
cd c:\xampp\htdocs\Backend-2.0\backend\src\main\java\com\veterinaria\veterinaria\service

findstr /n "isActivo DisabledException" UserDetailsServiceImpl.java

findstr /n "isActivo DisabledException ACCESO" AuthService.java
```

Esto verificará que los cambios están en los archivos.

---

**Última actualización:** 5 de diciembre de 2025  
**Propósito:** Diagnóstico detallado paso a paso
