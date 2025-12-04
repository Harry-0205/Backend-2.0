package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.MascotaResponse;
import com.veterinaria.veterinaria.dto.ApiResponse;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.service.MascotaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getAllMascotas() {
        // Obtener el usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(username);
        if (!usuarioAutenticadoOpt.isPresent()) {
            return ResponseEntity.ok(List.of());
        }
        
        Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
        
        // Verificar roles
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        List<Mascota> mascotas;
        
        if (isVeterinario) {
            // Si es veterinario, obtener solo las mascotas que ha atendido
            mascotas = mascotaService.findMascotasAtendidasByVeterinario(usuarioAutenticado.getDocumento());
            System.out.println("=== DEBUG: Veterinario " + username + " consultando mascotas atendidas: " + mascotas.size());
        } else if (isAdmin || isRecepcionista) {
            // Admin y Recepcionista ven solo mascotas cuyos propietarios pertenecen a su veterinaria
            if (usuarioAutenticado.getVeterinaria() != null) {
                Long veterinariaId = usuarioAutenticado.getVeterinaria().getId();
                mascotas = mascotaService.findByPropietarioVeterinariaId(veterinariaId);
                System.out.println("=== DEBUG: " + (isAdmin ? "Admin" : "Recepcionista") + " " + username + 
                    " consultando mascotas de veterinaria ID " + veterinariaId + ": " + mascotas.size() + " mascotas");
            } else {
                // Si no tiene veterinaria asignada, no puede ver ninguna mascota
                mascotas = List.of();
                System.out.println("=== DEBUG: " + (isAdmin ? "Admin" : "Recepcionista") + " " + username + 
                    " sin veterinaria asignada, no puede ver mascotas");
            }
        } else {
            mascotas = List.of();
        }
        
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Page<Mascota>> getAllMascotas(Pageable pageable) {
        Page<Mascota> mascotas = mascotaService.findAll(pageable);
        return ResponseEntity.ok(mascotas);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MascotaResponse> getMascotaById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Mascota> mascota = mascotaService.findById(id);
        if (!mascota.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verificar roles
        boolean isCliente = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        // Si es cliente, solo puede ver sus propias mascotas
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            if (mascota.get().getPropietario() == null || 
                !mascota.get().getPropietario().getUsername().equals(username)) {
                System.out.println("❌ Cliente " + username + " intentó ver mascota de otro propietario");
                return ResponseEntity.status(403).build();
            }
        }
        
        return ResponseEntity.ok(new MascotaResponse(mascota.get()));
    }
    
    @GetMapping("/propietario/{propietarioDocumento}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MascotaResponse>> getMascotasByPropietario(@PathVariable String propietarioDocumento) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Verificar roles
        boolean isCliente = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        // Si es cliente, verificar que esté consultando sus propias mascotas
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            Optional<Usuario> propietarioOpt = usuarioService.findById(propietarioDocumento);
            if (!propietarioOpt.isPresent() || !propietarioOpt.get().getUsername().equals(username)) {
                System.out.println("❌ Cliente " + username + " intentó ver mascotas de otro propietario: " + propietarioDocumento);
                return ResponseEntity.status(403).build();
            }
            System.out.println("✅ Cliente " + username + " consultando sus propias mascotas");
        }
        
        List<Mascota> mascotas = mascotaService.findByPropietarioDocumento(propietarioDocumento);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/propietario/{propietarioDocumento}/activas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MascotaResponse>> getMascotasActivasByPropietario(@PathVariable String propietarioDocumento) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Verificar roles
        boolean isCliente = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        // Si es cliente, verificar que esté consultando sus propias mascotas
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            Optional<Usuario> propietarioOpt = usuarioService.findById(propietarioDocumento);
            if (!propietarioOpt.isPresent() || !propietarioOpt.get().getUsername().equals(username)) {
                System.out.println("❌ Cliente " + username + " intentó ver mascotas activas de otro propietario: " + propietarioDocumento);
                return ResponseEntity.status(403).build();
            }
            System.out.println("✅ Cliente " + username + " consultando sus mascotas activas");
        }
        
        List<Mascota> mascotas = mascotaService.findActiveMascotasByPropietario(propietarioDocumento);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/activas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getMascotasActivas() {
        List<Mascota> mascotas = mascotaService.findActiveMascotas();
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/buscar/especie/{especie}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getMascotasByEspecie(@PathVariable String especie) {
        List<Mascota> mascotas = mascotaService.findByEspecie(especie);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/buscar/nombre/{nombre}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<Mascota>> getMascotasByNombre(@PathVariable String nombre) {
        List<Mascota> mascotas = mascotaService.findByNombre(nombre);
        return ResponseEntity.ok(mascotas);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE')")
    public ResponseEntity<Mascota> createMascota(@RequestBody Mascota mascota) {
        // Asegurar que el propietario existe antes de crear la mascota
        if (mascota.getPropietario() != null && mascota.getPropietario().getDocumento() != null) {
            Optional<Usuario> propietario = usuarioService.findById(mascota.getPropietario().getDocumento());
            if (propietario.isPresent()) {
                mascota.setPropietario(propietario.get());
                Mascota savedMascota = mascotaService.save(mascota);
                return ResponseEntity.ok(savedMascota);
            } else {
                return ResponseEntity.badRequest().build(); // Propietario no encontrado
            }
        }
        return ResponseEntity.badRequest().build(); // Datos de propietario inválidos
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Mascota> updateMascota(@PathVariable Long id, @RequestBody Mascota mascota) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Mascota> existingMascotaOpt = mascotaService.findById(id);
        if (!existingMascotaOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Mascota existingMascota = existingMascotaOpt.get();
        
        // Verificar roles
        boolean isCliente = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isRecepcionista = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        // Si es cliente, verificar que sea su propia mascota
        if (isCliente && !isAdmin && !isRecepcionista && !isVeterinario) {
            if (existingMascota.getPropietario() == null || 
                !existingMascota.getPropietario().getUsername().equals(username)) {
                System.out.println("❌ Cliente " + username + " intentó modificar mascota de otro propietario");
                return ResponseEntity.status(403).build();
            }
            System.out.println("✅ Cliente " + username + " modificando su propia mascota");
        }
        
        // Actualizar solo los campos editables, manteniendo el propietario original
        if (mascota.getNombre() != null) existingMascota.setNombre(mascota.getNombre());
        if (mascota.getEspecie() != null) existingMascota.setEspecie(mascota.getEspecie());
        if (mascota.getRaza() != null) existingMascota.setRaza(mascota.getRaza());
        if (mascota.getSexo() != null) existingMascota.setSexo(mascota.getSexo());
        if (mascota.getFechaNacimiento() != null) existingMascota.setFechaNacimiento(mascota.getFechaNacimiento());
        if (mascota.getPeso() != null) existingMascota.setPeso(mascota.getPeso());
        if (mascota.getColor() != null) existingMascota.setColor(mascota.getColor());
        if (mascota.getObservaciones() != null) existingMascota.setObservaciones(mascota.getObservaciones());
        
        // Solo ADMIN o RECEPCIONISTA pueden cambiar el estado activo
        if (mascota.getActivo() != null && (isAdmin || isRecepcionista)) {
            existingMascota.setActivo(mascota.getActivo());
        }
        
        // No cambiar el propietario ni el ID (protección adicional)
        // existingMascota.setPropietario() - NO TOCAR
        // existingMascota.setId() - NO TOCAR
        
        Mascota updatedMascota = mascotaService.update(existingMascota);
        return ResponseEntity.ok(updatedMascota);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMascota(@PathVariable Long id) {
        Optional<Mascota> mascota = mascotaService.findById(id);
        if (mascota.isPresent()) {
            mascotaService.deleteById(id);
            return ResponseEntity.ok(
                ApiResponse.success("Mascota eliminada exitosamente")
            );
        }
        return ResponseEntity.status(404).body(
            ApiResponse.error("Mascota no encontrada", "No existe una mascota con el ID: " + id)
        );
    }
    
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<ApiResponse<Mascota>> deactivateMascota(@PathVariable Long id) {
        Mascota updated = mascotaService.deactivate(id);
        if (updated != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Mascota desactivada exitosamente", updated)
            );
        }
        return ResponseEntity.status(404).body(
            ApiResponse.error("Mascota no encontrada", "No existe una mascota con el ID: " + id)
        );
    }
    
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<ApiResponse<Mascota>> activateMascota(@PathVariable Long id) {
        Mascota updated = mascotaService.activate(id);
        if (updated != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Mascota activada exitosamente", updated)
            );
        }
        return ResponseEntity.status(404).body(
            ApiResponse.error("Mascota no encontrada", "No existe una mascota con el ID: " + id)
        );
    }
}