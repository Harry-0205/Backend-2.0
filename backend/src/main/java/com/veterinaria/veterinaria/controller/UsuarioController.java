package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Rol;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.dto.UsuarioResponse;
import com.veterinaria.veterinaria.dto.UsuarioRequest;
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
    public ResponseEntity<List<UsuarioResponse>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        List<UsuarioResponse> response = usuarios.stream()
                .map(UsuarioResponse::new)
                .collect(Collectors.toList());
        System.out.println("=== DEBUG: Total usuarios encontrados: " + usuarios.size());
        return ResponseEntity.ok(response);
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or @usuarioService.findById(#documento).orElse(null)?.username == authentication.name")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable String documento) {
        Optional<Usuario> usuario = usuarioService.findById(documento);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or #username == authentication.name")
    public ResponseEntity<Usuario> getUsuarioByUsername(@PathVariable String username) {
        Optional<Usuario> usuario = usuarioService.findByUsername(username);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> getUsuariosActivos() {
        List<Usuario> usuarios = usuarioService.findActiveUsers();
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/rol/{rolNombre}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> getUsuariosByRol(@PathVariable String rolNombre) {
        List<Usuario> usuarios = usuarioService.findByRole(rolNombre);
        return ResponseEntity.ok(usuarios);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> createUsuario(@RequestBody UsuarioRequest usuarioRequest) {
        try {
            Usuario usuario = convertToEntity(usuarioRequest);
            Usuario savedUsuario = usuarioService.save(usuario);
            return ResponseEntity.ok(new UsuarioResponse(savedUsuario));
        } catch (Exception e) {
            System.err.println("Error creating usuario: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{documento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or @usuarioService.findById(#documento).orElse(null)?.username == authentication.name")
    public ResponseEntity<UsuarioResponse> updateUsuario(@PathVariable String documento, @RequestBody UsuarioRequest usuarioRequest, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Optional<Usuario> existingUsuario = usuarioService.findById(documento);
            if (existingUsuario.isPresent()) {
                Usuario existing = existingUsuario.get();
                
                // Si el usuario actual es RECEPCIONISTA y el usuario a editar es ADMIN, denegar
                boolean isRecepcionista = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
                boolean targetIsAdmin = existing.getRoles().stream()
                    .anyMatch(rol -> rol.getNombre().equals("ROLE_ADMIN"));
                
                if (isRecepcionista && targetIsAdmin) {
                    return ResponseEntity.status(403).build(); // Forbidden
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
                    Set<Rol> roles = new HashSet<>();
                    for (String roleName : usuarioRequest.getRoles()) {
                        // Asegurar que el rol tenga el prefijo ROLE_ si no lo tiene
                        String roleNameWithPrefix = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                        Optional<Rol> role = rolRepository.findByNombre(roleNameWithPrefix);
                        if (role.isPresent()) {
                            roles.add(role.get());
                        } else {
                            System.err.println("Role not found during update: " + roleNameWithPrefix);
                        }
                    }
                    existing.setRoles(roles);
                }
                
                // Actualizar veterinaria si es veterinario y se proporciona veterinariaId
                if (usuarioRequest.getVeterinariaId() != null) {
                    boolean esVeterinario = existing.getRoles().stream()
                        .anyMatch(r -> r.getNombre().equals("ROLE_VETERINARIO"));
                    
                    if (esVeterinario) {
                        Optional<Veterinaria> veterinaria = veterinariaService.findById(usuarioRequest.getVeterinariaId());
                        if (veterinaria.isPresent()) {
                            existing.setVeterinaria(veterinaria.get());
                        } else {
                            System.err.println("Veterinaria not found: " + usuarioRequest.getVeterinariaId());
                        }
                    }
                } else if (usuarioRequest.getVeterinariaId() == null) {
                    // Si veterinariaId es null explícitamente, limpiar la veterinaria
                    boolean esVeterinario = existing.getRoles().stream()
                        .anyMatch(r -> r.getNombre().equals("ROLE_VETERINARIO"));
                    if (!esVeterinario) {
                        existing.setVeterinaria(null);
                    }
                }
                
                Usuario updatedUsuario = usuarioService.save(existing);
                return ResponseEntity.ok(new UsuarioResponse(updatedUsuario));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating usuario: " + e.getMessage());
            return ResponseEntity.badRequest().build();
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
        
        // Convertir roles string a entidades Rol
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Rol> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                // Asegurar que el rol tenga el prefijo ROLE_ si no lo tiene
                String roleNameWithPrefix = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                Optional<Rol> role = rolRepository.findByNombre(roleNameWithPrefix);
                if (role.isPresent()) {
                    roles.add(role.get());
                } else {
                    System.err.println("Role not found: " + roleNameWithPrefix);
                }
            }
            usuario.setRoles(roles);
        }
        
        // Asignar veterinaria si es veterinario y se proporciona veterinariaId
        if (request.getVeterinariaId() != null) {
            boolean esVeterinario = request.getRoles() != null && 
                request.getRoles().stream().anyMatch(r -> r.equals("ROLE_VETERINARIO"));
            
            if (esVeterinario) {
                Optional<Veterinaria> veterinaria = veterinariaService.findById(request.getVeterinariaId());
                if (veterinaria.isPresent()) {
                    usuario.setVeterinaria(veterinaria.get());
                } else {
                    System.err.println("Veterinaria not found: " + request.getVeterinariaId());
                }
            }
        }
        
        return usuario;
    }
    
    @DeleteMapping("/{documento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUsuario(@PathVariable String documento) {
        usuarioService.deleteById(documento);
        return ResponseEntity.ok().build();
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
}