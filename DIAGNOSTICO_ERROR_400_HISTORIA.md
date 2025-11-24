# 🔧 DIAGNÓSTICO COMPLETO - Error 400 al Crear Historia Clínica

## 📋 PASOS DE DIAGNÓSTICO

### **PASO 1: Verificar que el JSON esté correcto**

**Tu JSON actual debe ser EXACTAMENTE así:**

```json
{
    "fechaConsulta": "2025-10-28T15:00:00",
    "motivoConsulta": "Control de rutina - Prueba Postman",
    "sintomas": "Ninguno aparente",
    "diagnostico": "Paciente sano",
    "tratamiento": "Continuar con rutina normal",
    "medicamentos": "Ninguno",
    "peso": 25.8,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 20,
    "observaciones": "Excelente estado general",
    "recomendaciones": "Continuar con alimentación balanceada",
    "mascota": {
        "id": 1
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

**⚠️ IMPORTANTE:**
- NO uses `mascotaId`, usa `mascota: {id: 1}`
- NO uses `veterinarioDocumento`, usa `veterinario: {documento: "87654321"}`
- Las comillas dobles deben ser `"` no `'`
- El documento del veterinario debe estar entre comillas: `"87654321"`

---

### **PASO 2: Verificar Headers en Postman**

Asegúrate de tener estos headers:

```
Content-Type: application/json
Authorization: Bearer [TU_TOKEN_DE_VETERINARIO]
```

**Para obtener el token:**
1. Hacer login como veterinario
2. Copiar el token de la respuesta
3. Pegarlo en el header Authorization

---

### **PASO 3: Verificar que la mascota existe en la BD**

Ejecuta en MySQL:

```sql
SELECT id, nombre, especie FROM mascotas WHERE id = 1;
```

**Si NO devuelve resultados:**
- La mascota con ID 1 no existe
- Debes usar un ID que exista o crear una mascota primero

**Para ver todas las mascotas:**
```sql
SELECT id, nombre, especie, propietario_documento FROM mascotas;
```

---

### **PASO 4: Verificar que el veterinario existe**

Ejecuta en MySQL:

```sql
SELECT documento, username, nombres, apellidos 
FROM usuarios 
WHERE documento = '87654321';
```

**Si NO devuelve resultados:**
- El veterinario con documento 87654321 no existe
- Debes usar el documento correcto

**Para ver todos los veterinarios:**
```sql
SELECT u.documento, u.username, u.nombres, u.apellidos
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO';
```

---

### **PASO 5: Revisar los logs del backend**

En la consola donde está corriendo el backend, busca mensajes como:

```
Error creating historia clinica: ...
Mascota no encontrada con ID: 1
Veterinario no encontrado con documento: 87654321
Mascota requerida pero no proporcionada
Veterinario requerido pero no proporcionado
```

Estos mensajes te dirán exactamente cuál es el problema.

---

## 🚨 POSIBLES CAUSAS Y SOLUCIONES

### **Causa 1: La mascota con ID 1 no existe**

**Solución:** Crear una mascota primero o usar un ID existente.

**Para crear una mascota:**

```
POST http://localhost:8080/api/mascotas
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
    "nombre": "Max",
    "especie": "PERRO",
    "raza": "Labrador",
    "fechaNacimiento": "2020-05-15",
    "sexo": "MACHO",
    "color": "Dorado",
    "peso": 25.5,
    "propietario": {
        "documento": "33333333"
    }
}
```

---

### **Causa 2: El veterinario con documento 87654321 no existe**

**Solución:** Usar el documento correcto del veterinario.

**Para encontrar veterinarios:**
```sql
SELECT documento, username FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO';
```

Luego usa ese documento en el JSON.

---

### **Causa 3: El formato del JSON está incorrecto**

**Verifica que:**
- [ ] Uses `mascota: {id: 1}` NO `mascotaId: 1`
- [ ] Uses `veterinario: {documento: "87654321"}` NO `veterinarioDocumento: "87654321"`
- [ ] El documento esté entre comillas: `"87654321"`
- [ ] La fecha esté en formato ISO: `"2025-10-28T15:00:00"`

---

### **Causa 4: No tienes el header de autenticación**

**Solución:** Agregar el header:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

### **Causa 5: El token expiró o es inválido**

**Solución:** Hacer login nuevamente:

```
POST http://localhost:8080/api/auth/signin

{
    "username": "dr.garcia",
    "password": "123456"
}
```

Copiar el nuevo token y usarlo.

---

## ✅ PRUEBA CON DATOS MÍNIMOS

Prueba primero con un JSON mínimo:

```json
{
    "fechaConsulta": "2025-10-28T15:00:00",
    "mascota": {
        "id": 1
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

Si esto funciona, entonces el problema está en algún campo opcional.

---

## 🔍 SCRIPT DE VERIFICACIÓN COMPLETA

Ejecuta este script SQL para ver todos los datos necesarios:

```sql
-- Ejecutar en MySQL
USE veterinaria_db;

-- Ver mascotas disponibles
SELECT 'MASCOTAS:' as tipo;
SELECT id, nombre, especie, propietario_documento FROM mascotas;

-- Ver veterinarios disponibles
SELECT 'VETERINARIOS:' as tipo;
SELECT u.documento, u.username, u.nombres, u.apellidos
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO';

-- Ver historias clínicas existentes
SELECT 'HISTORIAS EXISTENTES:' as tipo;
SELECT id, fecha_consulta, mascota_id, veterinario_documento 
FROM historias_clinicas;
```

---

## 📞 INFORMACIÓN NECESARIA PARA AYUDARTE

Por favor proporciona:

1. **El JSON exacto que estás enviando** (copia y pega desde Postman)
2. **El mensaje de error completo** (de la pestaña Body en Postman)
3. **Los resultados de ejecutar:**
   ```sql
   SELECT id, nombre FROM mascotas WHERE id = 1;
   SELECT documento, username FROM usuarios WHERE documento = '87654321';
   ```
4. **Los logs del backend** (de la consola donde corre el servidor)

Con esta información podré darte la solución exacta.

---

**Fecha:** 28 de octubre de 2025
