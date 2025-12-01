# Actualización de Perfil de Usuario

## Resumen de Cambios

Se ha implementado una funcionalidad completa para que **todos los usuarios** puedan actualizar su propia información personal sin necesidad de permisos especiales.

## Cambios en el Backend

### 1. Nuevo DTO: `UpdatePerfilRequest.java`
- **Ubicación**: `backend/src/main/java/com/veterinaria/veterinaria/dto/UpdatePerfilRequest.java`
- **Campos**:
  - `email`: Correo electrónico
  - `telefono`: Número de teléfono
  - `direccion`: Dirección física
  - `passwordActual`: Contraseña actual (para validación)
  - `passwordNueva`: Nueva contraseña

### 2. Nuevo Endpoint en `UsuarioController.java`
- **Ruta**: `PUT /api/usuarios/perfil`
- **Autenticación**: Requiere usuario autenticado (cualquier rol)
- **Funcionalidades**:
  - ✅ Actualizar email (con validación de formato y unicidad)
  - ✅ Actualizar teléfono
  - ✅ Actualizar dirección
  - ✅ Cambiar contraseña (requiere contraseña actual)
  - ✅ Validaciones de seguridad
  - ✅ Solo actualiza campos proporcionados

## Cambios en el Frontend

### 1. Servicio `userService.ts`
- **Nueva función**: `updatePerfil(data: UpdatePerfilData)`
- **Interface**: `UpdatePerfilData` con campos opcionales
- **Endpoint**: `PUT /api/usuarios/perfil`

### 2. Componente `UserProfile.tsx`
- Actualizado para usar el nuevo endpoint unificado
- Ahora utiliza `updatePerfil()` en lugar de `updateUsuario()` y `changePassword()` por separado
- Mejor manejo de errores y validaciones
- Solo envía los campos que han cambiado

## Características de Seguridad

### Validaciones del Backend:
1. **Email**:
   - Formato válido (regex)
   - No puede estar registrado por otro usuario
   
2. **Contraseña**:
   - Requiere contraseña actual para cambiar
   - Mínimo 6 caracteres
   - Se encripta con BCrypt antes de guardar

3. **Autorización**:
   - Solo el usuario autenticado puede modificar su propio perfil
   - No requiere roles especiales (ADMIN, RECEPCIONISTA, etc.)

## Uso desde el Frontend

### Actualizar información de contacto:
```typescript
await updatePerfil({
  email: 'nuevo@email.com',
  telefono: '3001234567',
  direccion: 'Calle 123 #45-67'
});
```

### Cambiar contraseña:
```typescript
await updatePerfil({
  passwordActual: 'contraseñaVieja',
  passwordNueva: 'contraseñaNueva123'
});
```

### Actualizar todo junto:
```typescript
await updatePerfil({
  email: 'nuevo@email.com',
  telefono: '3001234567',
  direccion: 'Calle 123 #45-67',
  passwordActual: 'contraseñaVieja',
  passwordNueva: 'contraseñaNueva123'
});
```

## Pruebas Recomendadas

1. ✅ Actualizar email con formato válido
2. ✅ Intentar usar email de otro usuario (debe fallar)
3. ✅ Actualizar teléfono y dirección
4. ✅ Cambiar contraseña con contraseña actual correcta
5. ✅ Intentar cambiar contraseña con contraseña actual incorrecta (debe fallar)
6. ✅ Intentar cambiar contraseña con menos de 6 caracteres (debe fallar)
7. ✅ Verificar que usuarios CLIENTE, VETERINARIO, RECEPCIONISTA y ADMIN puedan actualizar su perfil

## Endpoints Existentes Mantenidos

- `PUT /api/usuarios/{documento}` - Sigue existiendo para que ADMIN y RECEPCIONISTA actualicen otros usuarios
- `POST /api/usuarios/{documento}/cambiar-password` - Sigue existiendo para compatibilidad

## Beneficios

✅ Todos los usuarios pueden gestionar su propia información  
✅ No requiere permisos especiales  
✅ Validaciones robustas de seguridad  
✅ Interfaz de usuario intuitiva  
✅ Código más limpio y mantenible  

---
**Fecha de implementación**: 1 de diciembre de 2025
