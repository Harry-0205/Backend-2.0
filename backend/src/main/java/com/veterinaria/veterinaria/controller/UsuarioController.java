package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Rol;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.dto.UsuarioResponse;
import com.veterinaria.veterinaria.dto.UsuarioRequest;
import com.veterinaria.veterinaria.dto.UpdatePerfilRequest;
import com.veterinaria.veterinaria.dto.ApiResponse;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.VeterinariaService;
import com.veterinaria.veterinaria.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> getAllUsuarios(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        List<Usuario> usuarios;
        
        // Obtener el usuario autenticado
        Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(userDetails.getUsername());
        
        if (!usuarioAutenticadoOpt.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("No se encontró el usuario autenticado", List.of()));
        }
        
        Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
        
        // Verificar roles
        boolean isAdmin = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        boolean isRecepcionista = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        
        if (isVeterinario) {
            // Si es veterinario, solo obtener los clientes que ha atendido
            usuarios = usuarioService.findClientesAtendidosPorVeterinario(usuarioAutenticado.getDocumento());
            System.out.println("=== DEBUG: Veterinario " + userDetails.getUsername() + " consultando sus clientes atendidos: " + usuarios.size());
        } else if (isAdmin || isRecepcionista) {
            // Admin y Recepcionista ven solo usuarios de su veterinaria
            System.out.println("=== DEBUG DETALLADO: Usuario " + userDetails.getUsername());
            System.out.println("=== DEBUG DETALLADO: Documento: " + usuarioAutenticado.getDocumento());
            System.out.println("=== DEBUG DETALLADO: Veterinaria: " + usuarioAutenticado.getVeterinaria());
            System.out.println("=== DEBUG DETALLADO: Veterinaria es null? " + (usuarioAutenticado.getVeterinaria() == null));
            
            if (usuarioAutenticado.getVeterinaria() != null) {
                Long veterinariaId = usuarioAutenticado.getVeterinaria().getId();
                System.out.println("=== DEBUG DETALLADO: Veterinaria ID: " + veterinariaId);
                usuarios = usuarioService.findByVeterinariaId(veterinariaId);
                System.out.println("=== DEBUG: " + (isAdmin ? "Admin" : "Recepcionista") + " " + userDetails.getUsername() + 
                    " consultando usuarios de veterinaria ID " + veterinariaId + ": " + usuarios.size() + " usuarios");
            } else {
                // Si no tiene veterinaria asignada, no puede ver ningún usuario
                usuarios = List.of();
                System.out.println("=== DEBUG ALERTA: " + (isAdmin ? "Admin" : "Recepcionista") + " " + userDetails.getUsername() + 
                    " sin veterinaria asignada, no puede ver usuarios. ESTO DEBE SER CORREGIDO EN LA BD!");
            }
        } else {
            usuarios = List.of();
        }
        
        List<UsuarioResponse> response = usuarios.stream()
                .map(UsuarioResponse::new)
                .collect(Collectors.toList());
        
        String message = isVeterinario 
            ? "Clientes atendidos obtenidos exitosamente" 
            : "Usuarios de la veterinaria obtenidos exitosamente";
        
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
    
    @GetMapping("/veterinarios")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE') or hasRole('VETERINARIO')")
    public ResponseEntity<List<UsuarioResponse>> getVeterinarios() {
        System.out.println("=== DEBUG: Endpoint /veterinarios llamado");
        List<Usuario> usuarios = usuarioService.findAll();
        System.out.println("=== DEBUG: Total usuarios en DB: " + usuarios.size());
        
        List<UsuarioResponse> veterinarios = usuarios.stream()
                .filter(usuario -> {
                    boolean esVeterinario = usuario.getRoles().stream()
                        .anyMatch(rol -> {
                            String nombreRol = rol.getNombre();
                            System.out.println("=== DEBUG: Revisando rol: " + nombreRol + " para usuario: " + usuario.getUsername());
                            return nombreRol.equals("VETERINARIO");
                        });
                    if (esVeterinario) {
                        System.out.println("=== DEBUG: Veterinario encontrado: " + usuario.getNombres() + " " + usuario.getApellidos());
                    }
                    return esVeterinario;
                })
                .filter(usuario -> usuario.getActivo() != null && usuario.getActivo()) // Solo veterinarios activos
                .map(UsuarioResponse::new)
                .collect(Collectors.toList());
        System.out.println("=== DEBUG: Total veterinarios encontrados: " + veterinarios.size());
        return ResponseEntity.ok(veterinarios);
    }
    
    @GetMapping("/debug/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getDebugCount() {
        long count = usuarioService.count();
        return ResponseEntity.ok("Total usuarios en DB: " + count);
    }
    
    @GetMapping("/veterinarios/public")
    public ResponseEntity<List<UsuarioResponse>> getVeterinariosPublic() {
        System.out.println("=== DEBUG: Endpoint público /veterinarios/public llamado");
        List<Usuario> usuarios = usuarioService.findAll();
        System.out.println("=== DEBUG: Total usuarios en DB: " + usuarios.size());
        
        List<UsuarioResponse> veterinarios = usuarios.stream()
                .filter(usuario -> {
                    boolean esVeterinario = usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getNombre().equals("VETERINARIO"));
                    if (esVeterinario) {
                        System.out.println("=== DEBUG: Veterinario encontrado: " + usuario.getNombres() + " " + usuario.getApellidos());
                    }
                    return esVeterinario;
                })
                .filter(usuario -> usuario.getActivo() != null && usuario.getActivo())
                .map(UsuarioResponse::new)
                .collect(Collectors.toList());
        System.out.println("=== DEBUG: Total veterinarios públicos encontrados: " + veterinarios.size());
        return ResponseEntity.ok(veterinarios);
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<Page<Usuario>> getAllUsuarios(Pageable pageable) {
        Page<Usuario> usuarios = usuarioService.findAll(pageable);
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/{documento}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getUsuarioById(@PathVariable String documento, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Optional<Usuario> usuario = usuarioService.findById(documento);
        
        if (!usuario.isPresent()) {
            return ResponseEntity.status(404).body(
                ApiResponse.error("Usuario no encontrado", "No existe un usuario con el documento: " + documento)
            );
        }
        
        // Obtener usuario autenticado
        Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(userDetails.getUsername());
        if (!usuarioAutenticadoOpt.isPresent()) {
            return ResponseEntity.status(403).body(
                ApiResponse.error("Acceso denegado", "No se pudo verificar la identidad del usuario")
            );
        }
        
        Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
        
        // Verificar si el usuario autenticado es veterinario
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        boolean isCliente = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        
        System.out.println("🔍 DEBUG getUsuarioById - Usuario autenticado: " + userDetails.getUsername());
        System.out.println("🔍 DEBUG getUsuarioById - Documento solicitado: " + documento);
        System.out.println("🔍 DEBUG getUsuarioById - Documento autenticado: " + usuarioAutenticado.getDocumento());
        System.out.println("🔍 DEBUG getUsuarioById - isCliente: " + isCliente + ", isAdmin: " + isAdmin + ", isRecep: " + isRecepcionista + ", isVet: " + isVeterinario);
        
        // Si es CLIENTE, solo puede ver su propio perfil
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            if (!documento.equals(usuarioAutenticado.getDocumento())) {
                System.out.println("❌ Cliente " + usuarioAutenticado.getDocumento() + " intentó consultar perfil de otro usuario: " + documento);
                return ResponseEntity.status(403).body(
                    ApiResponse.error("Acceso denegado", "Solo puede consultar su propio perfil")
                );
            }
            System.out.println("✅ Cliente " + usuarioAutenticado.getDocumento() + " consultando su propio perfil");
            return ResponseEntity.ok(
                ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
            );
        }
        
        if (isVeterinario) {
            // Permitir si es su propio perfil
            if (documento.equals(usuarioAutenticado.getDocumento())) {
                return ResponseEntity.ok(
                    ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
                );
            }
            
            // Verificar si el usuario consultado es un cliente que ha atendido
            Usuario usuarioConsultado = usuario.get();
            boolean esCliente = usuarioConsultado.getRoles().stream()
                .anyMatch(rol -> rol.getNombre().equals("ROLE_CLIENTE"));
            
            if (esCliente) {
                List<Usuario> clientesAtendidos = usuarioService.findClientesAtendidosPorVeterinario(usuarioAutenticado.getDocumento());
                boolean haAtendidoCliente = clientesAtendidos.stream()
                    .anyMatch(c -> c.getDocumento().equals(documento));
                
                if (haAtendidoCliente) {
                    return ResponseEntity.ok(
                        ApiResponse.success("Perfil de cliente obtenido exitosamente", new UsuarioResponse(usuario.get()))
                    );
                }
            }
            
            // Si no cumple ninguna condición, denegar acceso
            return ResponseEntity.status(403).body(
                ApiResponse.error("Acceso denegado", "No tiene permisos para ver este perfil")
            );
        }
        
        // Admin y Recepcionista pueden ver cualquier perfil
        return ResponseEntity.ok(
            ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
        );
    }
    
    @GetMapping("/username/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getUsuarioByUsername(@PathVariable String username, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Optional<Usuario> usuario = usuarioService.findByUsername(username);
        
        if (!usuario.isPresent()) {
            return ResponseEntity.status(404).body(
                ApiResponse.error("Usuario no encontrado", "No existe un usuario con el username: " + username)
            );
        }
        
        // Verificar si el usuario autenticado es veterinario
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        boolean isCliente = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        
        System.out.println("🔍 DEBUG getUsuarioByUsername - Usuario autenticado: " + userDetails.getUsername());
        System.out.println("🔍 DEBUG getUsuarioByUsername - Username solicitado: " + username);
        System.out.println("🔍 DEBUG getUsuarioByUsername - isCliente: " + isCliente + ", isAdmin: " + isAdmin + ", isRecep: " + isRecepcionista + ", isVet: " + isVeterinario);
        
        // Si es CLIENTE, solo puede ver su propio perfil
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            if (!username.equals(userDetails.getUsername())) {
                System.out.println("❌ Cliente " + userDetails.getUsername() + " intentó consultar perfil de otro usuario: " + username);
                return ResponseEntity.status(403).body(
                    ApiResponse.error("Acceso denegado", "Solo puede consultar su propio perfil")
                );
            }
            System.out.println("✅ Cliente " + userDetails.getUsername() + " consultando su propio perfil");
            return ResponseEntity.ok(
                ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
            );
        }
        
        if (isVeterinario) {
            // Permitir si es su propio perfil
            if (username.equals(userDetails.getUsername())) {
                return ResponseEntity.ok(
                    ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
                );
            }
            
            // Verificar si el usuario consultado es un cliente que ha atendido
            Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (veterinarioOpt.isPresent()) {
                String veterinarioDocumento = veterinarioOpt.get().getDocumento();
                Usuario usuarioConsultado = usuario.get();
                
                boolean esCliente = usuarioConsultado.getRoles().stream()
                    .anyMatch(rol -> rol.getNombre().equals("ROLE_CLIENTE"));
                
                if (esCliente) {
                    List<Usuario> clientesAtendidos = usuarioService.findClientesAtendidosPorVeterinario(veterinarioDocumento);
                    boolean haAtendidoCliente = clientesAtendidos.stream()
                        .anyMatch(c -> c.getDocumento().equals(usuarioConsultado.getDocumento()));
                    
                    if (haAtendidoCliente) {
                        return ResponseEntity.ok(
                            ApiResponse.success("Perfil de cliente obtenido exitosamente", new UsuarioResponse(usuario.get()))
                        );
                    }
                }
                
                // Si no cumple ninguna condición, denegar acceso
                return ResponseEntity.status(403).body(
                    ApiResponse.error("Acceso denegado", "No tiene permisos para ver este perfil")
                );
            }
        }
        
        // Admin y Recepcionista pueden ver cualquier perfil
        return ResponseEntity.ok(
            ApiResponse.success("Perfil obtenido exitosamente", new UsuarioResponse(usuario.get()))
        );
    }
    
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> getUsuariosActivos() {
        List<Usuario> usuarios = usuarioService.findActiveUsers();
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/rol/{rolNombre}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<Usuario>> getUsuariosByRol(@PathVariable String rolNombre, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        // Verificar si el usuario autenticado es veterinario
        boolean isVeterinario = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        if (isVeterinario) {
            // Los veterinarios solo pueden consultar clientes y solo los que han atendido
            if (!rolNombre.equals("CLIENTE") && !rolNombre.equals("ROLE_CLIENTE")) {
                // Si intenta consultar otro rol, retornar 403 Forbidden
                return ResponseEntity.status(403).build();
            }
            
            // Obtener solo los clientes que ha atendido
            Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (veterinarioOpt.isPresent()) {
                String veterinarioDocumento = veterinarioOpt.get().getDocumento();
                List<Usuario> clientesAtendidos = usuarioService.findClientesAtendidosPorVeterinario(veterinarioDocumento);
                return ResponseEntity.ok(clientesAtendidos);
            } else {
                return ResponseEntity.ok(List.of()); // Lista vacía si no se encuentra el veterinario
            }
        }
        
        // Admin y Recepcionista pueden ver usuarios por cualquier rol
        List<Usuario> usuarios = usuarioService.findByRole(rolNombre);
        return ResponseEntity.ok(usuarios);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> createUsuario(
            @RequestBody UsuarioRequest usuarioRequest,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            System.out.println("=== DEBUG CREATE USER: Request recibido");
            System.out.println("=== Documento: " + usuarioRequest.getDocumento());
            System.out.println("=== Username: " + usuarioRequest.getUsername());
            System.out.println("=== Tipo Documento: " + usuarioRequest.getTipoDocumento());
            System.out.println("=== Roles: " + usuarioRequest.getRoles());
            System.out.println("=== Veterinaria ID actual: " + usuarioRequest.getVeterinariaId());
            
            // Obtener la veterinaria del usuario autenticado (admin o recepcionista)
            Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(userDetails.getUsername());
            
            // Verificar si el usuario autenticado es recepcionista
            boolean esRecepcionista = userDetails.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_RECEPCIONISTA"));
            
            // Si es recepcionista, validar que no esté intentando crear un administrador
            if (esRecepcionista && usuarioRequest.getRoles() != null) {
                boolean intentaCrearAdmin = usuarioRequest.getRoles().stream()
                        .anyMatch(rol -> rol.equalsIgnoreCase("ADMIN") || rol.equalsIgnoreCase("ROLE_ADMIN"));
                
                if (intentaCrearAdmin) {
                    System.out.println("=== DEBUG: Recepcionista intentó crear un usuario con rol ADMIN - BLOQUEADO");
                    return ResponseEntity.badRequest().body(
                        ApiResponse.error("No tiene permisos para crear usuarios con rol Administrador", null)
                    );
                }
            }
            
            if (usuarioAutenticadoOpt.isPresent()) {
                Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
                
                // Asignar automáticamente la veterinaria del admin/recepcionista al nuevo usuario
                if (usuarioAutenticado.getVeterinaria() != null) {
                    usuarioRequest.setVeterinariaId(usuarioAutenticado.getVeterinaria().getId());
                    System.out.println("=== DEBUG: Asignando veterinaria " + usuarioAutenticado.getVeterinaria().getNombre() + 
                                     " (ID: " + usuarioAutenticado.getVeterinaria().getId() + ") al nuevo usuario " + usuarioRequest.getUsername());
                } else {
                    System.out.println("=== DEBUG ALERTA: Usuario autenticado NO tiene veterinaria asignada!");
                }
            }
            
            Usuario usuario = convertToEntity(usuarioRequest);
            Usuario savedUsuario = usuarioService.save(usuario);
            System.out.println("=== DEBUG: Usuario guardado exitosamente con ID: " + savedUsuario.getDocumento());
            
            return ResponseEntity.ok(
                ApiResponse.success("Usuario creado exitosamente", new UsuarioResponse(savedUsuario))
            );
        } catch (Exception e) {
            System.err.println("❌ ERROR COMPLETO creating usuario: " + e.getClass().getName());
            System.err.println("❌ Mensaje: " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "Error desconocido: " + e.getClass().getSimpleName();
            }
            
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear usuario", errorMessage)
            );
        }
    }
    
    @PutMapping("/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UsuarioResponse>> updatePerfil(
            @RequestBody UpdatePerfilRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Obtener el usuario autenticado
            Optional<Usuario> usuarioOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado"));
            }
            
            Usuario usuario = usuarioOpt.get();
            boolean cambiosRealizados = false;
            
            // Actualizar email si se proporciona
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                // Validar formato de email
                if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                    return ResponseEntity.status(400).body(ApiResponse.error("Formato de email inválido"));
                }
                
                // Verificar si el email ya existe para otro usuario
                Optional<Usuario> usuarioConEmail = usuarioService.findByEmail(request.getEmail());
                if (usuarioConEmail.isPresent() && !usuarioConEmail.get().getDocumento().equals(usuario.getDocumento())) {
                    return ResponseEntity.status(400).body(ApiResponse.error("El email ya está registrado por otro usuario"));
                }
                
                usuario.setEmail(request.getEmail());
                cambiosRealizados = true;
                System.out.println("✅ Email actualizado para usuario: " + usuario.getUsername());
            }
            
            // Actualizar teléfono si se proporciona
            if (request.getTelefono() != null && !request.getTelefono().trim().isEmpty()) {
                usuario.setTelefono(request.getTelefono());
                cambiosRealizados = true;
                System.out.println("✅ Teléfono actualizado para usuario: " + usuario.getUsername());
            }
            
            // Actualizar dirección si se proporciona
            if (request.getDireccion() != null && !request.getDireccion().trim().isEmpty()) {
                usuario.setDireccion(request.getDireccion());
                cambiosRealizados = true;
                System.out.println("✅ Dirección actualizada para usuario: " + usuario.getUsername());
            }
            
            // Actualizar contraseña si se proporciona tanto la actual como la nueva
            if (request.getPasswordActual() != null && !request.getPasswordActual().trim().isEmpty() &&
                request.getPasswordNueva() != null && !request.getPasswordNueva().trim().isEmpty()) {
                
                System.out.println("🔐 DEBUG: Intentando cambiar contraseña para usuario: " + usuario.getUsername());
                System.out.println("🔐 DEBUG: passwordActual recibida: " + (request.getPasswordActual() != null ? "SÍ" : "NO"));
                System.out.println("🔐 DEBUG: passwordNueva recibida: " + (request.getPasswordNueva() != null ? "SÍ" : "NO"));
                
                // Verificar la contraseña actual
                boolean passwordMatch = passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword());
                System.out.println("🔐 DEBUG: Contraseña actual coincide: " + passwordMatch);
                
                if (!passwordMatch) {
                    System.out.println("❌ DEBUG: Contraseña actual incorrecta");
                    return ResponseEntity.status(400).body(ApiResponse.error("La contraseña actual es incorrecta"));
                }
                
                // Validar la nueva contraseña
                if (request.getPasswordNueva().length() < 6) {
                    System.out.println("❌ DEBUG: Nueva contraseña muy corta: " + request.getPasswordNueva().length() + " caracteres");
                    return ResponseEntity.status(400).body(ApiResponse.error("La nueva contraseña debe tener al menos 6 caracteres"));
                }
                
                String nuevaPasswordEncoded = passwordEncoder.encode(request.getPasswordNueva());
                usuario.setPassword(nuevaPasswordEncoded);
                cambiosRealizados = true;
                System.out.println("✅ Contraseña actualizada para usuario: " + usuario.getUsername());
            } else {
                System.out.println("⚠️ DEBUG: No se recibieron ambas contraseñas para cambio");
                if (request.getPasswordActual() != null) System.out.println("   - passwordActual: presente");
                if (request.getPasswordNueva() != null) System.out.println("   - passwordNueva: presente");
            }
            
            if (!cambiosRealizados) {
                return ResponseEntity.status(400).body(ApiResponse.error("No se proporcionaron datos para actualizar"));
            }
            
            System.out.println("💾 DEBUG: Guardando cambios para usuario: " + usuario.getUsername());
            System.out.println("💾 DEBUG: Email: " + usuario.getEmail());
            System.out.println("💾 DEBUG: Teléfono: " + usuario.getTelefono());
            System.out.println("💾 DEBUG: Dirección: " + usuario.getDireccion());
            System.out.println("💾 DEBUG: Password hash length: " + (usuario.getPassword() != null ? usuario.getPassword().length() : 0));
            
            // Guardar los cambios
            Usuario usuarioActualizado = usuarioService.save(usuario);
            System.out.println("✅ DEBUG: Usuario guardado exitosamente");
            
            UsuarioResponse response = new UsuarioResponse(usuarioActualizado);
            
            return ResponseEntity.ok(ApiResponse.success("Perfil actualizado exitosamente", response));
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar perfil: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error al actualizar el perfil: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{documento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or @usuarioService.findById(#documento).orElse(null)?.username == authentication.name")
    public ResponseEntity<ApiResponse<UsuarioResponse>> updateUsuario(@PathVariable String documento, @RequestBody UsuarioRequest usuarioRequest, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Optional<Usuario> existingUsuario = usuarioService.findById(documento);
            if (existingUsuario.isPresent()) {
                Usuario existing = existingUsuario.get();
                
                // Verificar roles del usuario autenticado
                boolean isRecepcionista = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
                boolean isCliente = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
                boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                boolean isVeterinario = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
                boolean targetIsAdmin = existing.getRoles().stream()
                    .anyMatch(rol -> rol.getNombre().equals("ROLE_ADMIN"));
                
                // Si el usuario actual es RECEPCIONISTA y el usuario a editar es ADMIN, denegar
                if (isRecepcionista && targetIsAdmin) {
                    return ResponseEntity.status(403).body(
                        ApiResponse.error("Acceso denegado", "No tiene permisos para editar administradores")
                    );
                }
                
                // Si es CLIENTE editando su propio perfil, bloquear completamente - deben usar /perfil
                if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
                    System.out.println("❌ CLIENTE intentó usar PUT /usuarios/{documento} - BLOQUEADO");
                    return ResponseEntity.status(403).body(
                        ApiResponse.error("Acceso denegado", "Los clientes deben usar el endpoint PUT /api/usuarios/perfil para actualizar su información personal")
                    );
                }
                
                // Actualizar campos básicos
                if (usuarioRequest.getUsername() != null) existing.setUsername(usuarioRequest.getUsername());
                if (usuarioRequest.getNombres() != null) existing.setNombres(usuarioRequest.getNombres());
                if (usuarioRequest.getApellidos() != null) existing.setApellidos(usuarioRequest.getApellidos());
                if (usuarioRequest.getEmail() != null) existing.setEmail(usuarioRequest.getEmail());
                if (usuarioRequest.getTelefono() != null) existing.setTelefono(usuarioRequest.getTelefono());
                if (usuarioRequest.getDireccion() != null) existing.setDireccion(usuarioRequest.getDireccion());
                if (usuarioRequest.getTipoDocumento() != null) existing.setTipoDocumento(usuarioRequest.getTipoDocumento());
                if (usuarioRequest.getFechaNacimiento() != null) existing.setFechaNacimiento(usuarioRequest.getFechaNacimiento());
                if (usuarioRequest.getActivo() != null) existing.setActivo(usuarioRequest.getActivo());
                  // Solo actualizar la contraseña si se proporciona una nueva (no vacía)
                if (usuarioRequest.getPassword() != null && !usuarioRequest.getPassword().trim().isEmpty()) {
                    existing.setPassword(passwordEncoder.encode(usuarioRequest.getPassword()));
                }
                
                // Actualizar roles solo si se proporcionan
                if (usuarioRequest.getRoles() != null && !usuarioRequest.getRoles().isEmpty()) {
                    // Si es recepcionista, validar que no esté intentando asignar rol de administrador
                    if (isRecepcionista) {
                        boolean intentaAsignarAdmin = usuarioRequest.getRoles().stream()
                                .anyMatch(rol -> rol.equalsIgnoreCase("ADMIN") || rol.equalsIgnoreCase("ROLE_ADMIN") || rol.equals("1"));
                        
                        if (intentaAsignarAdmin) {
                            System.out.println("=== DEBUG: Recepcionista intentó asignar rol ADMIN - BLOQUEADO");
                            return ResponseEntity.status(403).body(
                                ApiResponse.error("No tiene permisos para asignar el rol de Administrador", null)
                            );
                        }
                    }
                    
                    Set<Rol> roles = new HashSet<>();
                    for (String roleValue : usuarioRequest.getRoles()) {
                        Rol rol = null;
                        
                        // Intentar como ID numérico primero
                        try {
                            Long roleId = Long.parseLong(roleValue);
                            Optional<Rol> roleOpt = rolRepository.findById(roleId);
                            if (roleOpt.isPresent()) {
                                rol = roleOpt.get();
                            } else {
                                System.err.println("Role not found with ID during update: " + roleId);
                            }
                        } catch (NumberFormatException e) {
                            // No es un número, buscar por nombre
                            String roleNameWithPrefix = roleValue.startsWith("ROLE_") ? roleValue : "ROLE_" + roleValue;
                            Optional<Rol> roleOpt = rolRepository.findByNombre(roleNameWithPrefix);
                            if (roleOpt.isPresent()) {
                                rol = roleOpt.get();
                            } else {
                                System.err.println("Role not found during update: " + roleNameWithPrefix);
                            }
                        }
                        
                        if (rol != null) {
                            roles.add(rol);
                        }
                    }
                    existing.setRoles(roles);
                }
                
                // Actualizar veterinaria si se proporciona veterinariaId
                if (usuarioRequest.getVeterinariaId() != null) {
                    // Permitir asociar veterinaria a ADMIN, RECEPCIONISTA y VETERINARIO
                    boolean puedeAsociarVeterinaria = existing.getRoles().stream()
                        .anyMatch(r -> r.getNombre().equals("ROLE_ADMIN") || 
                                      r.getNombre().equals("ROLE_RECEPCIONISTA") || 
                                      r.getNombre().equals("ROLE_VETERINARIO"));
                    
                    if (puedeAsociarVeterinaria) {
                        Optional<Veterinaria> veterinaria = veterinariaService.findById(usuarioRequest.getVeterinariaId());
                        if (veterinaria.isPresent()) {
                            existing.setVeterinaria(veterinaria.get());
                            System.out.println("✅ Veterinaria " + veterinaria.get().getNombre() + " asociada al usuario " + existing.getUsername());
                        } else {
                            System.err.println("❌ Veterinaria not found: " + usuarioRequest.getVeterinariaId());
                        }
                    } else {
                        System.out.println("⚠️ El usuario no tiene un rol que permita asociar veterinaria");
                    }
                } else if (usuarioRequest.getVeterinariaId() == null) {
                    // Si veterinariaId es null explícitamente, limpiar la veterinaria solo si NO es admin, vet o recep
                    boolean mantenerVeterinaria = existing.getRoles().stream()
                        .anyMatch(r -> r.getNombre().equals("ROLE_ADMIN") || 
                                      r.getNombre().equals("ROLE_RECEPCIONISTA") || 
                                      r.getNombre().equals("ROLE_VETERINARIO"));
                    if (!mantenerVeterinaria) {
                        existing.setVeterinaria(null);
                    }
                }
                
                Usuario updatedUsuario = usuarioService.save(existing);
                return ResponseEntity.ok(
                    ApiResponse.success("Usuario actualizado exitosamente", new UsuarioResponse(updatedUsuario))
                );
            }
            return ResponseEntity.status(404).body(
                ApiResponse.error("Usuario no encontrado", "No existe un usuario con el documento: " + documento)
            );
        } catch (Exception e) {
            System.err.println("Error updating usuario: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar usuario", e.getMessage())
            );
        }
    }
    // Método auxiliar para convertir UsuarioRequest a Usuario
    private Usuario convertToEntity(UsuarioRequest request) {
        Usuario usuario = new Usuario();
        usuario.setDocumento(request.getDocumento());
        usuario.setUsername(request.getUsername());
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());
        usuario.setTipoDocumento(request.getTipoDocumento());
        usuario.setFechaNacimiento(request.getFechaNacimiento());
        usuario.setActivo(request.getActivo() != null ? request.getActivo() : true);
        
        // Hashear la contraseña antes de guardarla
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Convertir roles (soporta tanto IDs numéricos como nombres)
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Rol> roles = new HashSet<>();
            for (String roleValue : request.getRoles()) {
                Rol rol = null;
                
                // Intentar como ID numérico primero
                try {
                    Long roleId = Long.parseLong(roleValue);
                    Optional<Rol> roleOpt = rolRepository.findById(roleId);
                    if (roleOpt.isPresent()) {
                        rol = roleOpt.get();
                        System.out.println("=== DEBUG: Rol encontrado por ID " + roleId + ": " + rol.getNombre());
                    } else {
                        System.err.println("❌ Rol no encontrado con ID: " + roleId);
                    }
                } catch (NumberFormatException e) {
                    // No es un número, buscar por nombre
                    String roleNameWithPrefix = roleValue.startsWith("ROLE_") ? roleValue : "ROLE_" + roleValue;
                    Optional<Rol> roleOpt = rolRepository.findByNombre(roleNameWithPrefix);
                    if (roleOpt.isPresent()) {
                        rol = roleOpt.get();
                        System.out.println("=== DEBUG: Rol encontrado por nombre " + roleNameWithPrefix + ": " + rol.getNombre());
                    } else {
                        System.err.println("❌ Rol no encontrado con nombre: " + roleNameWithPrefix);
                    }
                }
                
                if (rol != null) {
                    roles.add(rol);
                }
            }
            usuario.setRoles(roles);
            System.out.println("=== DEBUG: Total roles asignados: " + roles.size());
        }
        
        // Asignar veterinaria si se proporciona veterinariaId
        if (request.getVeterinariaId() != null) {
            Optional<Veterinaria> veterinaria = veterinariaService.findById(request.getVeterinariaId());
            if (veterinaria.isPresent()) {
                usuario.setVeterinaria(veterinaria.get());
                System.out.println("=== DEBUG convertToEntity: Veterinaria " + veterinaria.get().getNombre() + 
                                 " asignada al usuario " + usuario.getUsername());
            } else {
                System.err.println("Veterinaria not found: " + request.getVeterinariaId());
            }
        } else {
            System.out.println("=== DEBUG convertToEntity: No veterinariaId proporcionado para usuario " + 
                             (request.getUsername() != null ? request.getUsername() : "nuevo"));
        }
        
        return usuario;
    }
    
    @DeleteMapping("/{documento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUsuario(@PathVariable String documento) {
        try {
            Optional<Usuario> usuario = usuarioService.findById(documento);
            if (usuario.isPresent()) {
                usuarioService.deleteById(documento);
                return ResponseEntity.ok(
                    ApiResponse.success("Usuario eliminado exitosamente")
                );
            }
            return ResponseEntity.status(404).body(
                ApiResponse.error("Usuario no encontrado", "No existe un usuario con el documento: " + documento)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar usuario", e.getMessage())
            );
        }
    }
    
    @PatchMapping("/{documento}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<?> deactivateUsuario(@PathVariable String documento, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        // Verificar si el usuario a desactivar es ADMIN
        Optional<Usuario> usuarioOpt = usuarioService.findById(documento);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            boolean isRecepcionista = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
            boolean targetIsAdmin = usuario.getRoles().stream()
                .anyMatch(rol -> rol.getNombre().equals("ROLE_ADMIN"));
            
            if (isRecepcionista && targetIsAdmin) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }
        
        usuarioService.deactivate(documento);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{documento}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateUsuario(@PathVariable String documento) {
        usuarioService.activate(documento);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/veterinarios/por-veterinaria/{veterinariaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE')")
    public ResponseEntity<List<UsuarioResponse>> getVeterinariosByVeterinaria(@PathVariable Long veterinariaId) {
        try {
            List<Usuario> veterinarios = usuarioService.findVeterinariosByVeterinariaId(veterinariaId);
            List<UsuarioResponse> response = veterinarios.stream()
                    .map(UsuarioResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting veterinarios by veterinaria: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{documento}/cambiar-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @PathVariable String documento,
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Verificar que el usuario solo pueda cambiar su propia contraseña (excepto admin)
            boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !userDetails.getUsername().equals(documento)) {
                return ResponseEntity.status(403).body(ApiResponse.error("No tiene permisos para cambiar la contraseña de otro usuario"));
            }
            
            // Buscar el usuario
            Optional<Usuario> usuarioOpt = usuarioService.findById(documento);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado"));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Verificar la contraseña actual
            if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
                return ResponseEntity.status(400).body(ApiResponse.error("La contraseña actual es incorrecta"));
            }
            
            // Validar la nueva contraseña
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                return ResponseEntity.status(400).body(ApiResponse.error("La nueva contraseña debe tener al menos 6 caracteres"));
            }
            
            // Cambiar la contraseña
            usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            usuarioService.save(usuario);
            
            System.out.println("✅ Contraseña cambiada exitosamente para usuario: " + documento);
            return ResponseEntity.ok(ApiResponse.success("Contraseña actualizada exitosamente", null));
        } catch (Exception e) {
            System.err.println("❌ Error al cambiar contraseña: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error al cambiar la contraseña: " + e.getMessage()));
        }
    }
    
    // Clase interna para el request de cambio de contraseña
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        
        public String getCurrentPassword() {
            return currentPassword;
        }
        
        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}