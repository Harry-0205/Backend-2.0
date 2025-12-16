package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.dto.VeterinariaResponse;
import com.veterinaria.veterinaria.dto.ApiResponse;
import com.veterinaria.veterinaria.service.VeterinariaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/veterinarias")
public class VeterinariaController {
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VeterinariaResponse>>> getAllVeterinarias(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        System.out.println("=== DEBUG GET VETERINARIAS ===");
        System.out.println("UserDetails: " + (userDetails != null ? userDetails.getUsername() : "null"));
        if (userDetails != null) {
            System.out.println("Authorities: " + userDetails.getAuthorities());
        }
        
        List<Veterinaria> veterinarias;
        
        // Verificar si el usuario autenticado es veterinario
        if (userDetails != null) {
            boolean isVeterinario = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isRecepcionista = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
            boolean isCliente = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
            
            System.out.println("Roles detectados - Veterinario: " + isVeterinario + ", Admin: " + isAdmin + 
                             ", Recepcionista: " + isRecepcionista + ", Cliente: " + isCliente);
            
            if (isVeterinario) {
                // Si es veterinario, solo retornar la veterinaria donde trabaja
                Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (veterinarioOpt.isPresent() && veterinarioOpt.get().getVeterinaria() != null) {
                    veterinarias = List.of(veterinarioOpt.get().getVeterinaria());
                    System.out.println("=== DEBUG: Veterinario " + userDetails.getUsername() + " consultando su veterinaria: " + veterinarias.get(0).getNombre());
                } else {
                    veterinarias = new ArrayList<>();
                    System.out.println("=== DEBUG: Veterinario " + userDetails.getUsername() + " no tiene veterinaria asignada");
                }
            } else if (isAdmin) {
                // Admin solo ve las veterinarias que él ha creado
                Optional<Usuario> adminOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (adminOpt.isPresent()) {
                    Usuario admin = adminOpt.get();
                    veterinarias = new ArrayList<>(veterinariaService.findByCreadoPorDocumento(admin.getDocumento()));
                    System.out.println("=== DEBUG: Admin " + userDetails.getUsername() + " consultando veterinarias creadas por él: " + veterinarias.size() + " veterinarias");
                    
                    // Recorrer recursivamente la cadena de creadores para obtener todas las veterinarias
                    String documentoCreador = admin.getCreadoPorDocumento();
                    int nivel = 1;
                    while (documentoCreador != null) {
                        List<Veterinaria> veterinariasDelCreador = veterinariaService.findByCreadoPorDocumento(documentoCreador);
                        System.out.println("=== DEBUG: Nivel " + nivel + " - Admin creador (" + documentoCreador + ") tiene " + veterinariasDelCreador.size() + " veterinarias");
                        
                        // Combinar sin duplicados
                        for (Veterinaria vet : veterinariasDelCreador) {
                            if (!veterinarias.contains(vet)) {
                                veterinarias.add(vet);
                            }
                        }
                        
                        // Buscar el siguiente nivel en la cadena
                        Optional<Usuario> creadorOpt = usuarioService.findByDocumento(documentoCreador);
                        if (creadorOpt.isPresent()) {
                            documentoCreador = creadorOpt.get().getCreadoPorDocumento();
                            nivel++;
                        } else {
                            documentoCreador = null;
                        }
                        
                        // Protección contra bucles infinitos
                        if (nivel > 10) {
                            System.out.println("=== ALERTA: Se alcanzó el límite de niveles de recursión (10)");
                            break;
                        }
                    }
                    System.out.println("=== DEBUG: Total de veterinarias después de recorrer " + (nivel - 1) + " niveles: " + veterinarias.size());
                } else {
                    veterinarias = new ArrayList<>();
                    System.out.println("=== ALERTA: Admin " + userDetails.getUsername() + " no encontrado en la base de datos");
                }
            } else if (isRecepcionista) {
                // Recepcionista ve solo su veterinaria asignada
                Optional<Usuario> usuarioOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (usuarioOpt.isPresent() && usuarioOpt.get().getVeterinaria() != null) {
                    veterinarias = List.of(usuarioOpt.get().getVeterinaria());
                    System.out.println("=== DEBUG: Recepcionista " + userDetails.getUsername() + " consultando su veterinaria: " + usuarioOpt.get().getVeterinaria().getNombre());
                } else {
                    veterinarias = new ArrayList<>();
                    System.out.println("=== ALERTA: Recepcionista " + userDetails.getUsername() + " sin veterinaria asignada");
                }
            } else if (isCliente) {
                // Cliente puede ver todas las veterinarias para agendar citas
                veterinarias = veterinariaService.findAll();
                System.out.println("=== DEBUG: Cliente " + userDetails.getUsername() + " consultando todas las veterinarias para agendar cita");
            } else {
                // Otros usuarios pueden ver todas
                veterinarias = veterinariaService.findAll();
            }
        } else {
            // Usuario no autenticado (público)
            veterinarias = veterinariaService.findAll();
        }
        
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            ApiResponse.success("Veterinarias obtenidas exitosamente", response)
        );
    }
    
    @GetMapping("/pageable")
    public ResponseEntity<Page<Veterinaria>> getAllVeterinarias(Pageable pageable) {
        Page<Veterinaria> veterinarias = veterinariaService.findAll(pageable);
        return ResponseEntity.ok(veterinarias);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VeterinariaResponse> getVeterinariaById(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Optional<Veterinaria> veterinariaOpt = veterinariaService.findById(id);
        
        if (!veterinariaOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verificar si el usuario autenticado es veterinario
        if (userDetails != null) {
            boolean isVeterinario = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            
            if (isVeterinario) {
                // Si es veterinario, solo puede ver su propia veterinaria
                Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (veterinarioOpt.isPresent() && veterinarioOpt.get().getVeterinaria() != null) {
                    Long veterinariaIdDelVeterinario = veterinarioOpt.get().getVeterinaria().getId();
                    if (!id.equals(veterinariaIdDelVeterinario)) {
                        // Intentando ver una veterinaria que no es la suya
                        return ResponseEntity.status(403).build();
                    }
                } else {
                    // Veterinario sin veterinaria asignada
                    return ResponseEntity.status(403).build();
                }
            }
        }
        
        return ResponseEntity.ok(new VeterinariaResponse(veterinariaOpt.get()));
    }
    
    @GetMapping("/activas")
    public ResponseEntity<List<VeterinariaResponse>> getVeterinariasActivas(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        List<Veterinaria> veterinarias;
        
        // Verificar si el usuario autenticado es veterinario
        if (userDetails != null) {
            boolean isVeterinario = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            
            if (isVeterinario) {
                // Si es veterinario, solo retornar su veterinaria si está activa
                Optional<Usuario> veterinarioOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (veterinarioOpt.isPresent() && veterinarioOpt.get().getVeterinaria() != null) {
                    Veterinaria veterinariaDelVet = veterinarioOpt.get().getVeterinaria();
                    if (veterinariaDelVet.getActivo() != null && veterinariaDelVet.getActivo()) {
                        veterinarias = List.of(veterinariaDelVet);
                    } else {
                        veterinarias = new ArrayList<>();
                    }
                } else {
                    veterinarias = new ArrayList<>();
                }
            } else {
                // Admin, Recepcionista o Cliente pueden ver todas las activas
                veterinarias = veterinariaService.findByActivoTrue();
            }
        } else {
            // Usuario no autenticado (público)
            veterinarias = veterinariaService.findByActivoTrue();
        }
        
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<List<VeterinariaResponse>> getVeterinariasByCiudad(@PathVariable String ciudad) {
        List<Veterinaria> veterinarias = veterinariaService.findByCiudad(ciudad);
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Veterinaria>> createVeterinaria(@Valid @RequestBody Veterinaria veterinaria, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            System.out.println("=== Creando veterinaria: " + veterinaria.getNombre());
            
            // Asignar el documento del usuario creador
            Usuario creador = null;
            if (userDetails != null) {
                Optional<Usuario> creadorOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (creadorOpt.isPresent()) {
                    creador = creadorOpt.get();
                    veterinaria.setCreadoPorDocumento(creador.getDocumento());
                    System.out.println("=== Veterinaria creada por: " + userDetails.getUsername() + " (Doc: " + creador.getDocumento() + ")");
                }
            }
            
            Veterinaria nuevaVeterinaria = veterinariaService.save(veterinaria);
            
            // Asignar automáticamente la veterinaria al admin SOLO si es su primera veterinaria
            if (creador != null && creador.getVeterinaria() == null) {
                creador.setVeterinaria(nuevaVeterinaria);
                usuarioService.save(creador);
                System.out.println("=== Primera veterinaria asignada al admin " + creador.getUsername() + ": " + nuevaVeterinaria.getNombre());
            } else if (creador != null && creador.getVeterinaria() != null) {
                System.out.println("=== Admin " + creador.getUsername() + " ya tiene veterinaria asignada: " + creador.getVeterinaria().getNombre() + ". No se reasigna.");
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Veterinaria creada exitosamente", nuevaVeterinaria)
            );
        } catch (Exception e) {
            System.err.println("❌ Error al crear veterinaria: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear veterinaria", e.getMessage())
            );
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Veterinaria>> updateVeterinaria(@PathVariable Long id, @Valid @RequestBody Veterinaria veterinariaDetails) {
        Optional<Veterinaria> optionalVeterinaria = veterinariaService.findById(id);
        
        if (optionalVeterinaria.isPresent()) {
            Veterinaria veterinaria = optionalVeterinaria.get();
            veterinaria.setNombre(veterinariaDetails.getNombre());
            veterinaria.setDireccion(veterinariaDetails.getDireccion());
            veterinaria.setTelefono(veterinariaDetails.getTelefono());
            veterinaria.setEmail(veterinariaDetails.getEmail());
            veterinaria.setCiudad(veterinariaDetails.getCiudad());
            veterinaria.setHorarioAtencion(veterinariaDetails.getHorarioAtencion());
            veterinaria.setServicios(veterinariaDetails.getServicios());
            // Permitir que el administrador actualice el estado 'activo' si se envía
            if (veterinariaDetails.getActivo() != null) {
                veterinaria.setActivo(veterinariaDetails.getActivo());
            }
            
            Veterinaria veterinariaActualizada = veterinariaService.save(veterinaria);
            return ResponseEntity.ok(
                ApiResponse.success("Veterinaria actualizada exitosamente", veterinariaActualizada)
            );
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("Veterinaria no encontrada", "No existe una veterinaria con el ID: " + id)
            );
        }
    }
    
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Veterinaria>> activarVeterinaria(@PathVariable Long id) {
        Veterinaria actualizado = veterinariaService.activate(id);
        if (actualizado != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Veterinaria activada exitosamente", actualizado)
            );
        }
        return ResponseEntity.status(404).body(
            ApiResponse.error("Veterinaria no encontrada", "No existe una veterinaria con el ID: " + id)
        );
    }
    
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Veterinaria>> desactivarVeterinaria(@PathVariable Long id) {
        Veterinaria actualizado = veterinariaService.deactivate(id);
        if (actualizado != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Veterinaria desactivada exitosamente", actualizado)
            );
        }
        return ResponseEntity.status(404).body(
            ApiResponse.error("Veterinaria no encontrada", "No existe una veterinaria con el ID: " + id)
        );
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVeterinaria(@PathVariable Long id) {
        Optional<Veterinaria> veterinaria = veterinariaService.findById(id);
        
        if (veterinaria.isPresent()) {
            veterinariaService.deleteById(id);
            return ResponseEntity.ok(
                ApiResponse.success("Veterinaria eliminada exitosamente")
            );
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("Veterinaria no encontrada", "No existe una veterinaria con el ID: " + id)
            );
        }
    }
}