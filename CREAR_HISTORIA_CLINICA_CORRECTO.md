# 🏥 Crear Historia Clínica - Formato JSON Correcto

## ❌ ERROR 400 - Tu JSON Actual (INCORRECTO)

```json
{
    "fechaConsulta": "2025-10-27T10:00:00",
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
    "mascotaId": 1,                    // ❌ INCORRECTO
    "veterinarioDocumento": "87654321" // ❌ INCORRECTO
}
```

---

## ✅ JSON CORRECTO (Solución)

```json
{
    "fechaConsulta": "2025-10-27T10:00:00",
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

---

## 📋 Plantilla Completa para Postman

### **Endpoint:** `POST http://localhost:8080/api/historias-clinicas`

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

### **Body (raw - JSON):**

```json
{
    "fechaConsulta": "2025-10-28T15:00:00",
    "motivoConsulta": "Control de rutina",
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

---

## 🔍 Verificar IDs Disponibles

### **1. Verificar Mascotas en la BD:**

```sql
SELECT id, nombre, propietario_documento 
FROM mascotas 
ORDER BY id;
```

### **2. Verificar Veterinarios:**

```sql
SELECT u.documento, u.username, u.nombres, u.apellidos
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO';
```

---

## 📝 Ejemplos con Diferentes Datos

### **Ejemplo 1: Historia Clínica de Vacunación**

```json
{
    "fechaConsulta": "2025-10-28T10:00:00",
    "motivoConsulta": "Vacunación anual",
    "sintomas": "Ninguno",
    "diagnostico": "Saludable",
    "tratamiento": "Vacunación Triple Felina",
    "medicamentos": "Vacuna Triple Felina",
    "peso": 4.2,
    "temperatura": 38.3,
    "frecuenciaCardiaca": 120,
    "frecuenciaRespiratoria": 25,
    "observaciones": "Animal tranquilo durante el procedimiento",
    "recomendaciones": "Reposo por 24 horas. Próxima vacuna en 1 año",
    "mascota": {
        "id": 1
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

### **Ejemplo 2: Consulta por Enfermedad**

```json
{
    "fechaConsulta": "2025-10-28T14:30:00",
    "motivoConsulta": "Vómitos y diarrea",
    "sintomas": "Vómitos frecuentes (3 veces hoy), diarrea, decaimiento",
    "diagnostico": "Gastroenteritis leve",
    "tratamiento": "Dieta blanda, hidratación",
    "medicamentos": "Metoclopramida 10mg cada 12h por 3 días",
    "peso": 22.5,
    "temperatura": 39.2,
    "frecuenciaCardiaca": 95,
    "frecuenciaRespiratoria": 28,
    "observaciones": "Deshidratación leve, mucosas rosadas",
    "recomendaciones": "Dieta blanda por 3 días. Control en 48h si no mejora",
    "mascota": {
        "id": 2
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

### **Ejemplo 3: Examen Físico General**

```json
{
    "fechaConsulta": "2025-10-28T16:00:00",
    "motivoConsulta": "Examen físico anual",
    "sintomas": "Ninguno",
    "diagnostico": "Excelente estado de salud",
    "tratamiento": "Ninguno necesario",
    "medicamentos": "Antiparasitario interno (Drontal Plus)",
    "peso": 15.3,
    "temperatura": 38.4,
    "frecuenciaCardiaca": 85,
    "frecuenciaRespiratoria": 22,
    "observaciones": "Pelaje brillante, dientes limpios, ojos claros",
    "recomendaciones": "Continuar con alimentación balanceada. Próximo control en 6 meses",
    "mascota": {
        "id": 3
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

---

## 🔗 Historia Clínica Asociada a una Cita (Opcional)

Si quieres asociar la historia clínica a una cita existente:

```json
{
    "fechaConsulta": "2025-10-28T15:00:00",
    "motivoConsulta": "Consulta agendada",
    "sintomas": "Ninguno",
    "diagnostico": "Saludable",
    "tratamiento": "Control preventivo",
    "medicamentos": "Ninguno",
    "peso": 25.8,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 20,
    "observaciones": "Todo normal",
    "recomendaciones": "Continuar cuidados habituales",
    "mascota": {
        "id": 1
    },
    "veterinario": {
        "documento": "87654321"
    },
    "cita": {
        "id": 1
    }
}
```

---

## ⚠️ Campos Requeridos vs Opcionales

### ✅ **Campos OBLIGATORIOS:**
- `fechaConsulta` - Fecha y hora de la consulta (formato ISO)
- `mascota.id` - ID de la mascota (debe existir en la BD)
- `veterinario.documento` - Documento del veterinario (debe existir en la BD)

### 📝 **Campos OPCIONALES:**
- `motivoConsulta`
- `sintomas`
- `diagnostico`
- `tratamiento`
- `medicamentos`
- `peso`
- `temperatura`
- `frecuenciaCardiaca`
- `frecuenciaRespiratoria`
- `observaciones`
- `recomendaciones`
- `cita.id` - Solo si está asociada a una cita

---

## 🚨 Errores Comunes

### **Error 1: mascotaId en lugar de mascota.id**

❌ **INCORRECTO:**
```json
{
    "mascotaId": 1,
    "veterinarioDocumento": "87654321"
}
```

✅ **CORRECTO:**
```json
{
    "mascota": {
        "id": 1
    },
    "veterinario": {
        "documento": "87654321"
    }
}
```

---

### **Error 2: Fecha en formato incorrecto**

❌ **INCORRECTO:**
```json
{
    "fechaConsulta": "28/10/2025 15:00"
}
```

✅ **CORRECTO:**
```json
{
    "fechaConsulta": "2025-10-28T15:00:00"
}
```

**Formato:** ISO 8601: `YYYY-MM-DDTHH:mm:ss`

---

### **Error 3: ID de mascota o documento de veterinario que no existe**

Si la mascota o veterinario no existen en la BD, recibirás **400 Bad Request**.

**Solución:** Verifica en la BD:

```sql
-- Verificar mascota
SELECT id, nombre FROM mascotas WHERE id = 1;

-- Verificar veterinario
SELECT documento, username FROM usuarios WHERE documento = '87654321';
```

---

## 🧪 Prueba Paso a Paso en Postman

### **Paso 1: Login como Veterinario**

```
POST http://localhost:8080/api/auth/signin
Content-Type: application/json

{
    "username": "dr.garcia",
    "password": "123456"
}
```

Copiar el `token` de la respuesta.

---

### **Paso 2: Crear Historia Clínica**

1. **Method:** POST
2. **URL:** `http://localhost:8080/api/historias-clinicas`
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer [PEGAR_TOKEN_AQUI]
   ```
4. **Body (raw - JSON):**
   ```json
   {
       "fechaConsulta": "2025-10-28T15:00:00",
       "motivoConsulta": "Control de rutina",
       "sintomas": "Ninguno",
       "diagnostico": "Saludable",
       "tratamiento": "Ninguno",
       "medicamentos": "Ninguno",
       "peso": 25.8,
       "temperatura": 38.5,
       "frecuenciaCardiaca": 80,
       "frecuenciaRespiratoria": 20,
       "observaciones": "Todo normal",
       "recomendaciones": "Continuar cuidados",
       "mascota": {
           "id": 1
       },
       "veterinario": {
           "documento": "87654321"
       }
   }
   ```
5. **Click:** Send

---

### **Paso 3: Verificar Respuesta**

**Respuesta esperada (200 OK):**
```json
{
    "id": 1,
    "fechaConsulta": "2025-10-28T15:00:00",
    "motivoConsulta": "Control de rutina",
    "sintomas": "Ninguno",
    "diagnostico": "Saludable",
    "tratamiento": "Ninguno",
    "medicamentos": "Ninguno",
    "peso": 25.8,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 20,
    "observaciones": "Todo normal",
    "recomendaciones": "Continuar cuidados",
    "fechaCreacion": "2025-10-28T15:30:45",
    "mascota": {
        "id": 1,
        "nombre": "Max"
    },
    "veterinario": {
        "documento": "87654321",
        "nombres": "Carlos",
        "apellidos": "García"
    }
}
```

---

## 📊 Verificar en Base de Datos

```sql
-- Ver todas las historias clínicas
SELECT 
    hc.id,
    hc.fecha_consulta,
    hc.motivo_consulta,
    hc.diagnostico,
    m.nombre as mascota,
    CONCAT(u.nombres, ' ', u.apellidos) as veterinario
FROM historias_clinicas hc
JOIN mascotas m ON hc.mascota_id = m.id
JOIN usuarios u ON hc.veterinario_documento = u.documento
ORDER BY hc.fecha_consulta DESC;
```

---

## ✅ Resumen de la Solución

### **Cambios necesarios en tu JSON:**

| Campo Actual | Campo Correcto |
|-------------|----------------|
| `"mascotaId": 1` | `"mascota": {"id": 1}` |
| `"veterinarioDocumento": "87654321"` | `"veterinario": {"documento": "87654321"}` |

---

**Fecha:** 28 de octubre de 2025  
**Estado:** ✅ Solución lista
