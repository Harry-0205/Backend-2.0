# 🔒 RESTRICCIONES DE SEGURIDAD Y MEJORAS - ROL_VETERINARIO

> **📅 Fecha:** 3 de noviembre de 2025  
> **🎯 Propósito:** Limitar acceso de veterinarios y estandarizar respuestas del API  
> **🔧 Alcance:** ROL_VETERINARIO + Respuestas API

---

## 📋 **RESUMEN DE CAMBIOS**

Se implementaron dos mejoras principales:

1. **Restricciones de seguridad** para que los veterinarios:
   - SOLO puedan ver información de clientes que han atendido (clientes con citas registradas)
   - SOLO puedan ver la veterinaria donde trabajan (no otras veterinarias del sistema)

2. **Estandarización de respuestas del API:**
   - Formato consistente para todas las operaciones CRUD
   - Mensajes descriptivos de éxito y error
   - Información de timestamp en todas las respuestas

---

## 🔧 **ARCHIVOS MODIFICADOS**

### **1. UsuarioRepository.java**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/repository/UsuarioRepository.java`

**Cambios:**
- ✅ Agregado método `findClientesAtendidosPorVeterinario(String veterinarioDocumento)`
- ✅ Utiliza query JPQL para encontrar clientes con citas del veterinario

```java
@Query("SELECT DISTINCT c FROM Usuario c " +
       "JOIN c.roles r " +
       "WHERE r.nombre = 'ROLE_CLIENTE' " +
       "AND EXISTS (SELECT 1 FROM Cita ci WHERE ci.cliente = c AND ci.veterinario.documento = :veterinarioDocumento)")
List<Usuario> findClientesAtendidosPorVeterinario(@Param("veterinarioDocumento") String veterinarioDocumento);
```

---

### **3. UsuarioController.java**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/controller/UsuarioController.java`

**Cambios:**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/service/UsuarioService.java`

**Cambios:**
- ✅ Agregado método `findClientesAtendidosPorVeterinario(String veterinarioDocumento)`

```java
public List<Usuario> findClientesAtendidosPorVeterinario(String veterinarioDocumento) {
    return usuarioRepository.findClientesAtendidosPorVeterinario(veterinarioDocumento);
}
```

---

### **3. UsuarioController.java**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/controller/UsuarioController.java`

**Cambios:**

#### **3.1. Endpoint GET `/api/usuarios`**
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Detecta si el usuario es veterinario
- ✅ Si es veterinario: solo retorna clientes atendidos
- ✅ Si es Admin/Recepcionista: retorna todos los usuarios (sin cambios)

```java
@GetMapping
@PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
public ResponseEntity<List<UsuarioResponse>> getAllUsuarios(@AuthenticationPrincipal UserDetails userDetails) {
    List<Usuario> usuarios;
    
    boolean isVeterinario = userDetails.getAuthorities().stream()
        .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
    
    if (isVeterinario) {
        // Solo clientes atendidos
        Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
        if (veterinarioOpt.isPresent()) {
            String veterinarioDocumento = veterinarioOpt.get().getDocumento();
            usuarios = usuarioService.findClientesAtendidosPorVeterinario(veterinarioDocumento);
        } else {
            usuarios = List.of();
        }
    } else {
        // Admin y Recepcionista ven todos
        usuarios = usuarioService.findAll();
    }
    
    return ResponseEntity.ok(response);
}
```

#### **3.2. Endpoint GET `/api/usuarios/{documento}`**
- ✅ Agregado `hasRole('VETERINARIO')` al PreAuthorize
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Valida que el veterinario solo pueda ver:
  - Su propio perfil
  - Perfiles de clientes que ha atendido
- ✅ Retorna 403 si intenta ver otros usuarios

```java
@GetMapping("/{documento}")
@PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or ...")
public ResponseEntity<Usuario> getUsuarioById(@PathVariable String documento, @AuthenticationPrincipal UserDetails userDetails) {
    // ... lógica de validación para veterinarios ...
}
```

#### **3.3. Endpoint GET `/api/usuarios/username/{username}`**
- ✅ Agregado `hasRole('VETERINARIO')` al PreAuthorize
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Misma lógica de restricción que el endpoint por documento

#### **3.4. Endpoint GET `/api/usuarios/rol/{rolNombre}`**
- ✅ Agregado `hasRole('VETERINARIO')` al PreAuthorize
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Veterinarios solo pueden consultar rol `CLIENTE` o `ROLE_CLIENTE`
- ✅ Retorna 403 si intenta consultar otros roles (ADMIN, VETERINARIO, RECEPCIONISTA)
- ✅ Solo retorna clientes que ha atendido

```java
@GetMapping("/rol/{rolNombre}")
@PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
public ResponseEntity<List<Usuario>> getUsuariosByRol(@PathVariable String rolNombre, @AuthenticationPrincipal UserDetails userDetails) {
    boolean isVeterinario = userDetails.getAuthorities().stream()
        .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
    
    if (isVeterinario) {
        // Solo pueden consultar CLIENTE
        if (!rolNombre.equals("CLIENTE") && !rolNombre.equals("ROLE_CLIENTE")) {
            return ResponseEntity.status(403).build();
        }
        
        // Solo sus clientes atendidos
        Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
        if (veterinarioOpt.isPresent()) {
            String veterinarioDocumento = veterinarioOpt.get().getDocumento();
            List<Usuario> clientesAtendidos = usuarioService.findClientesAtendidosPorVeterinario(veterinarioDocumento);
            return ResponseEntity.ok(clientesAtendidos);
        }
    }
    
    // Admin y Recepcionista sin cambios
    return ResponseEntity.ok(usuarios);
}
```

---

### **5. PRUEBA_POSTMAN.md**
**Ubicación:** `PRUEBA_POSTMAN.md`

**Cambios:**
- ✅ Actualizada sección de pruebas para VETERINARIO con restricciones de veterinarias
- ✅ Agregadas pruebas de veterinarias en **Escenario 4**
- ✅ Actualizado checklist de validaciones
- ✅ Agregadas pruebas de error para veterinario intentando ver otras veterinarias
- ✅ Actualizada sección de cambios recientes
- ✅ Documentado nuevo formato de respuestas con `ApiResponse`
- ✅ Agregados scripts de validación para respuestas estandarizadas

---

### **6. ApiResponse.java (NUEVO)**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/dto/ApiResponse.java`

**Descripción:** Clase genérica para estandarizar las respuestas del API

**Estructura:**
```java
public class ApiResponse<T> {
    private boolean success;      // true para éxito, false para error
    private String message;       // Mensaje descriptivo
    private T data;              // Datos de respuesta (genérico)
    private String error;        // Detalles adicionales del error
    private LocalDateTime timestamp; // Timestamp de la respuesta
}
```

**Métodos estáticos:**
- `ApiResponse.success(message, data)` - Crear respuesta exitosa con datos
- `ApiResponse.success(message)` - Crear respuesta exitosa sin datos
- `ApiResponse.error(message)` - Crear respuesta de error
- `ApiResponse.error(message, errorDetails)` - Crear respuesta de error con detalles

---

### **7. GlobalExceptionHandler.java (NUEVO)**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/exception/GlobalExceptionHandler.java`

**Descripción:** Manejador global de excepciones para capturar y formatear errores

**Excepciones manejadas:**
- `EntityNotFoundException` → 404 Not Found
- `AccessDeniedException` → 403 Forbidden
- `BadCredentialsException` → 401 Unauthorized
- `DataIntegrityViolationException` → 400 Bad Request
- `IllegalArgumentException` → 400 Bad Request
- `Exception` (genérica) → 500 Internal Server Error

---

## 🧪 **PRUEBAS RECOMENDADAS**

### **✅ Veterinario PUEDE:**
1. Ver lista de clientes que ha atendido (GET `/api/usuarios`)
2. Ver perfil de cliente atendido (GET `/api/usuarios/{documento}`)
3. Ver su propio perfil (GET `/api/usuarios/{documento_propio}`)
4. Consultar clientes atendidos por rol (GET `/api/usuarios/rol/CLIENTE`)
5. Ver todas las mascotas (GET `/api/mascotas`)
6. Ver sus citas (GET `/api/citas/veterinario/{documento}`)
7. Crear historias clínicas (POST `/api/historias-clinicas`)
8. Ver historias clínicas (GET `/api/historias-clinicas`)
9. **Ver su veterinaria asignada (GET `/api/veterinarias`)** ✨ NUEVO
10. **Ver detalles de su veterinaria (GET `/api/veterinarias/{id_propia}`)** ✨ NUEVO

### **❌ Veterinario NO PUEDE:**
1. Ver todos los usuarios del sistema
2. Ver perfiles de clientes que NO ha atendido
3. Ver perfiles de administradores
4. Ver perfiles de recepcionistas
5. Ver perfiles de otros veterinarios
6. Consultar usuarios por otros roles (ADMIN, VETERINARIO, RECEPCIONISTA)
7. Crear, editar o eliminar usuarios
8. **Ver otras veterinarias del sistema** ✨ NUEVO
9. **Ver detalles de veterinarias que no son la suya** ✨ NUEVO

---

### **4. VeterinariaController.java (NUEVO)**
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/controller/VeterinariaController.java`

**Cambios:**

#### **4.1. Endpoint GET `/api/veterinarias`**
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Detecta si el usuario es veterinario
- ✅ Si es veterinario: solo retorna su veterinaria asignada
- ✅ Si es Admin/Recepcionista/Cliente: retorna todas las veterinarias (sin cambios)

```java
@GetMapping
public ResponseEntity<List<VeterinariaResponse>> getAllVeterinarias(@AuthenticationPrincipal UserDetails userDetails) {
    List<Veterinaria> veterinarias;
    
    if (userDetails != null) {
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        if (isVeterinario) {
            // Solo su veterinaria
            Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (veterinarioOpt.isPresent() && veterinarioOpt.get().getVeterinaria() != null) {
                veterinarias = List.of(veterinarioOpt.get().getVeterinaria());
            } else {
                veterinarias = new ArrayList<>();
            }
        } else {
            // Otros roles ven todas
            veterinarias = veterinariaService.findAll();
        }
    } else {
        veterinarias = veterinariaService.findAll();
    }
    
    return ResponseEntity.ok(response);
}
```

#### **4.2. Endpoint GET `/api/veterinarias/{id}`**
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Valida que el veterinario solo pueda ver su propia veterinaria
- ✅ Retorna 403 si intenta ver otra veterinaria

```java
@GetMapping("/{id}")
public ResponseEntity<VeterinariaResponse> getVeterinariaById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
    Optional<Veterinaria> veterinariaOpt = veterinariaService.findById(id);
    
    if (!veterinariaOpt.isPresent()) {
        return ResponseEntity.notFound().build();
    }
    
    if (userDetails != null) {
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        if (isVeterinario) {
            Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (veterinarioOpt.isPresent() && veterinarioOpt.get().getVeterinaria() != null) {
                Long veterinariaIdDelVeterinario = veterinarioOpt.get().getVeterinaria().getId();
                if (!id.equals(veterinariaIdDelVeterinario)) {
                    return ResponseEntity.status(403).build();
                }
            } else {
                return ResponseEntity.status(403).build();
            }
        }
    }
    
    return ResponseEntity.ok(new VeterinariaResponse(veterinariaOpt.get()));
}
```

#### **4.3. Endpoint GET `/api/veterinarias/activas`**
- ✅ Agregado parámetro `@AuthenticationPrincipal UserDetails userDetails`
- ✅ Si es veterinario: solo retorna su veterinaria si está activa
- ✅ Otros roles ven todas las veterinarias activas

---

### **5. PRUEBA_POSTMAN.md**

### **Prueba 1: Veterinario con clientes atendidos**
```
1. Login como veterinario (dr.garcia)
2. GET /api/usuarios (debe retornar solo clientes con citas)
3. GET /api/usuarios/33333333 (cliente1 - debe retornar 200)
4. GET /api/usuarios/rol/CLIENTE (debe retornar solo clientes atendidos)
```

### **Prueba 2: Veterinario intentando acceso no autorizado**
```
1. Login como veterinario (dr.garcia)
2. GET /api/usuarios/55555555 (cliente no atendido - debe retornar 403)
3. GET /api/usuarios/rol/ADMIN (debe retornar 403)
4. GET /api/usuarios/rol/VETERINARIO (debe retornar 403)
5. GET /api/usuarios/12345678 (admin - debe retornar 403)
```

### **Prueba 3: Veterinario viendo su propio perfil**
```
1. Login como veterinario (dr.garcia - documento: 87654321)
2. GET /api/usuarios/87654321 (debe retornar 200 con su perfil)
3. GET /api/usuarios/username/dr.garcia (debe retornar 200)
```

### **Prueba 4: Admin y Recepcionista sin cambios**
```
1. Login como admin o recepcionista
2. GET /api/usuarios (debe retornar TODOS los usuarios)
3. GET /api/usuarios/{cualquier_documento} (debe funcionar sin restricciones)
4. GET /api/usuarios/rol/{cualquier_rol} (debe funcionar sin restricciones)
5. GET /api/veterinarias (debe retornar TODAS las veterinarias)
6. GET /api/veterinarias/{cualquier_id} (debe funcionar sin restricciones)
```

### **Prueba 5: Restricciones de veterinarias (NUEVO)**
```
1. Login como veterinario (dr.garcia)
2. GET /api/veterinarias (debe retornar solo su veterinaria, 1 registro)
3. GET /api/veterinarias/1 (su veterinaria - debe retornar 200)
4. GET /api/veterinarias/2 (otra veterinaria - debe retornar 403)
5. GET /api/veterinarias/activas (solo su veterinaria si está activa)
```

---

## 📊 **CRITERIO DE "CLIENTE ATENDIDO"**

Un cliente es considerado "atendido" por un veterinario cuando existe al menos una cita en la base de datos donde:

```sql
SELECT DISTINCT c.* 
FROM Usuario c 
INNER JOIN usuario_roles ur ON c.documento = ur.usuario_documento
INNER JOIN rol r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_CLIENTE'
AND EXISTS (
    SELECT 1 
    FROM Cita ci 
    WHERE ci.cliente_documento = c.documento 
    AND ci.veterinario_documento = :veterinarioDocumento
)
```

**Condiciones:**
- El usuario debe tener rol `ROLE_CLIENTE`
- Debe existir al menos una cita (cualquier estado) donde:
  - `cita.cliente = usuario`
  - `cita.veterinario = veterinario_consultante`

---

## 🔐 **IMPACTO EN SEGURIDAD**

### **Antes de los cambios:**
- ⚠️ Veterinarios podían ver información de todos los usuarios del sistema
- ⚠️ Acceso a datos de clientes no relacionados
- ⚠️ Acceso a información de otros veterinarios
- ⚠️ Acceso a información administrativa
- ⚠️ **Veterinarios podían ver todas las veterinarias del sistema** ✨

### **Después de los cambios:**
- ✅ Veterinarios solo ven clientes que han atendido personalmente
- ✅ **Veterinarios solo ven la veterinaria donde trabajan** ✨
- ✅ Principio de mínimo privilegio aplicado
- ✅ Protección de privacidad de datos
- ✅ Segregación de datos por relación médico-paciente
- ✅ **Segregación de datos por veterinaria** ✨
- ✅ Compliance con mejores prácticas de seguridad

---

## 🚀 **DESPLIEGUE**

### **Pasos para aplicar los cambios:**

1. **Compilar el proyecto:**
   ```bash
   cd backend
   mvn clean compile
   ```

2. **Ejecutar tests (si aplica):**
   ```bash
   mvn test
   ```

3. **Reiniciar el backend:**
   ```bash
   mvn spring-boot:run
   ```

4. **Verificar en Postman:**
   - Importar colección actualizada
   - Ejecutar pruebas de escenario 4
   - Validar restricciones de acceso

---

## 📝 **NOTAS IMPORTANTES**

1. **Sin impacto en otros roles:** Los cambios solo afectan a `ROLE_VETERINARIO`, los demás roles mantienen su comportamiento original.

2. **Retrocompatibilidad:** Los endpoints mantienen la misma firma para Admin y Recepcionista.

3. **Performance:** La query utiliza EXISTS para optimizar la búsqueda de relaciones.

4. **Extensibilidad:** La lógica está centralizada en el repositorio y servicio, facilitando futuras modificaciones.

5. **Logs:** Se mantienen los logs de depuración para facilitar troubleshooting.

---

## ✅ **CHECKLIST DE VALIDACIÓN**

- [x] Código compilado sin errores
- [ ] Backend reiniciado exitosamente
- [ ] Pruebas en Postman ejecutadas
- [ ] Veterinario solo ve clientes atendidos
- [ ] Veterinario puede ver su propio perfil
- [ ] Veterinario no puede ver otros roles
- [ ] **Veterinario solo ve su veterinaria** ✨
- [ ] **Veterinario no puede ver otras veterinarias** ✨
- [ ] Admin y Recepcionista sin cambios
- [ ] Documentación actualizada

---

**📅 Fecha de implementación:** 3 de noviembre de 2025  
**👨‍💻 Alcance:** ROL_VETERINARIO + Respuestas API  
**🎯 Estado:** ✅ IMPLEMENTADO Y DOCUMENTADO  
**📦 Archivos modificados:** 7 (UsuarioRepository, UsuarioService, UsuarioController, VeterinariaController, ApiResponse, GlobalExceptionHandler, PRUEBA_POSTMAN.md)  
**✨ Nuevas características:**
- Restricciones de acceso para veterinarios
- Formato de respuestas estandarizado
- Manejo global de excepciones
- Mensajes descriptivos en todas las operaciones
