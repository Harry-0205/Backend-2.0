# 🔧 INSTRUCCIONES PARA ACTUALIZAR ROLES CON IDS FIJOS

## Problema identificado
Los IDs de los roles se regeneraban en cada reinicio del backend porque:
- La entidad `Rol.java` usaba `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- El `application.properties` tenía `ddl-auto=update` que permitía modificaciones automáticas
- No se especificaban IDs fijos en el script SQL

## Cambios realizados

### 1. ✅ Modificación de la entidad `Rol.java`
**Ubicación:** `backend/src/main/java/com/veterinaria/veterinaria/entity/Rol.java`

**Cambio:**
```java
// ANTES:
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// DESPUÉS:
@Id
private Long id;
```

**Resultado:** Ahora los IDs se asignan manualmente desde el SQL, no se auto-generan.

---

### 2. ✅ Modificación de `application.properties`
**Ubicación:** `backend/src/main/resources/application.properties`

**Cambio:**
```properties
# ANTES:
spring.jpa.hibernate.ddl-auto=update

# DESPUÉS:
spring.jpa.hibernate.ddl-auto=validate
```

**Resultado:** Hibernate solo validará la estructura, NO la modificará automáticamente.

---

### 3. ✅ Actualización del script SQL
**Ubicación:** `setup-database-complete.sql`

**Cambio:**
```sql
-- ANTES:
INSERT INTO roles (nombre, descripcion, activo) VALUES
('ADMIN', 'Administrador del sistema con acceso completo', true),
...

-- DESPUÉS:
INSERT INTO roles (id, nombre, descripcion, activo) VALUES
(1, 'ADMIN', 'Administrador del sistema con acceso completo', true),
(2, 'VETERINARIO', 'Veterinario con acceso a consultas y tratamientos', true),
(3, 'CLIENTE', 'Cliente/propietario de mascotas', true),
(4, 'RECEPCIONISTA', 'Personal de recepción y programación de citas', true);
```

**Resultado:** Los roles siempre tendrán IDs fijos: 1, 2, 3, 4

---

## 📋 Pasos para aplicar los cambios

### Paso 1: Reiniciar la base de datos
Ejecuta el script SQL actualizado para recrear la base de datos con IDs fijos:

```bash
# Desde MySQL o phpMyAdmin, ejecuta:
mysql -u root -p veterinaria < setup-database-complete.sql
```

O manualmente:
1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Selecciona la base de datos `veterinaria`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `setup-database-complete.sql`
5. Haz clic en "Continuar"

### Paso 2: Recompilar el backend
En la carpeta `backend/`, ejecuta:

```bash
# Windows CMD
cd c:\xampp\htdocs\Backend-2.0\backend
mvnw clean package
```

### Paso 3: Reiniciar el backend
Detén el servidor actual (Ctrl+C) y vuelve a iniciarlo:

```bash
mvnw spring-boot:run
```

---

## ✅ Verificación

Después de aplicar los cambios, verifica que:

1. **Los IDs de roles son fijos:**
```sql
SELECT * FROM roles;
```
Deberías ver:
```
+----+---------------+------------------------------------------+--------+
| id | nombre        | descripcion                              | activo |
+----+---------------+------------------------------------------+--------+
|  1 | ADMIN         | Administrador del sistema con acc...     |      1 |
|  2 | VETERINARIO   | Veterinario con acceso a consulta...     |      1 |
|  3 | CLIENTE       | Cliente/propietario de mascotas          |      1 |
|  4 | RECEPCIONISTA | Personal de recepción y program...       |      1 |
+----+---------------+------------------------------------------+--------+
```

2. **Las relaciones usuarios_roles funcionan:**
```sql
SELECT u.username, r.nombre 
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id;
```

3. **El backend arranca sin errores de validación**

4. **Los IDs NO cambian después de reiniciar el backend múltiples veces**

---

## 🔐 Credenciales de prueba

Después de ejecutar el script, puedes usar:

| Usuario       | Contraseña | Rol            |
|---------------|------------|----------------|
| admin         | admin123   | ADMIN          |
| dr.garcia     | admin123   | VETERINARIO    |
| dra.martinez  | admin123   | VETERINARIO    |
| cliente1      | admin123   | CLIENTE        |
| cliente2      | admin123   | CLIENTE        |
| recepcion1    | admin123   | RECEPCIONISTA  |

---

## 🚨 Advertencias importantes

⚠️ **NO uses `ddl-auto=create` o `ddl-auto=create-drop`** - Estos modos eliminarán y recrearán las tablas en cada reinicio.

⚠️ **NO cambies manualmente los IDs de los roles en la base de datos** - Los IDs deben ser siempre: 1=ADMIN, 2=VETERINARIO, 3=CLIENTE, 4=RECEPCIONISTA

⚠️ **Si necesitas agregar un nuevo rol** - Asígnale un ID mayor a 4 (por ejemplo, 5) y añádelo tanto en el script SQL como en el código.

---

## 🎯 Resultado esperado

Con estos cambios:
- ✅ Los IDs de roles permanecerán **estables** entre reinicios
- ✅ No habrá **errores de foreign key** en `usuarios_roles`
- ✅ El backend **no modificará** automáticamente la estructura de la BD
- ✅ Los datos se **mantendrán persistentes**

---

**Fecha de actualización:** 28 de enero de 2025
