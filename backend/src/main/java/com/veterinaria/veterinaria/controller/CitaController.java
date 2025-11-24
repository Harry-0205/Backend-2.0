package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.CitaResponse;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Cita.EstadoCita;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.service.CitaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.MascotaService;
import com.veterinaria.veterinaria.service.VeterinariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/citas")
public class CitaController {
    
    @Autowired
    private CitaService citaService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<CitaResponse>> getAllCitas() {
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
        
        List<Cita> citas;
        
        if (isVeterinario) {
            // Si es veterinario, obtener solo sus citas
            citas = citaService.findByVeterinarioDocumento(usuarioAutenticado.getDocumento());
            System.out.println("=== DEBUG: Veterinario " + username + " consultando sus citas: " + citas.size());
        } else if (isAdmin || isRecepcionista) {
            // Admin y Recepcionista ven solo citas de su veterinaria
            if (usuarioAutenticado.getVeterinaria() != null) {
                Long veterinariaId = usuarioAutenticado.getVeterinaria().getId();
                citas = citaService.findByVeterinariaId(veterinariaId);
                System.out.println("=== DEBUG: " + (isAdmin ? "Admin" : "Recepcionista") + " " + username + 
                    " consultando citas de veterinaria ID " + veterinariaId + ": " + citas.size() + " citas");
            } else {
                // Si no tiene veterinaria asignada, no puede ver ninguna cita
                citas = List.of();
                System.out.println("=== DEBUG: " + (isAdmin ? "Admin" : "Recepcionista") + " " + username + 
                    " sin veterinaria asignada, no puede ver citas");
            }
        } else {
            citas = List.of();
        }
        
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Page<Cita>> getAllCitas(Pageable pageable) {
        Page<Cita> citas = citaService.findAll(pageable);
        return ResponseEntity.ok(citas);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @citaService.findById(#id).orElse(null)?.cliente?.username == authentication.name")
    public ResponseEntity<CitaResponse> getCitaById(@PathVariable Long id) {
    Optional<Cita> cita = citaService.findByIdWithRelations(id);
    return cita.map(c -> ResponseEntity.ok(new CitaResponse(c)))
        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cliente/{clienteDocumento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @usuarioService.findById(#clienteDocumento).orElse(null)?.username == authentication.name")
    public ResponseEntity<List<CitaResponse>> getCitasByCliente(@PathVariable String clienteDocumento) {
        List<Cita> citas = citaService.findByClienteDocumento(clienteDocumento);
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/veterinario/{veterinarioDocumento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or @usuarioService.findById(#veterinarioDocumento).orElse(null)?.username == authentication.name")
    public ResponseEntity<List<CitaResponse>> getCitasByVeterinario(@PathVariable String veterinarioDocumento) {
        List<Cita> citas = citaService.findByVeterinarioDocumento(veterinarioDocumento);
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/mascota/{mascotaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @mascotaService.findById(#mascotaId).orElse(null)?.propietario?.username == authentication.name")
    public ResponseEntity<List<CitaResponse>> getCitasByMascota(@PathVariable Long mascotaId) {
        List<Cita> citas = citaService.findByMascotaId(mascotaId);
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<CitaResponse>> getCitasByEstado(@PathVariable String estado) {
        try {
            Cita.EstadoCita estadoCita = Cita.EstadoCita.valueOf(estado.toUpperCase());
        List<Cita> citas = citaService.findByEstado(estadoCita);
            List<CitaResponse> response = citas.stream()
                    .map(CitaResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/fecha")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<CitaResponse>> getCitasByFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
    List<Cita> citas = citaService.findByFechaHoraBetween(inicio, fin);
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/hoy")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<CitaResponse>> getCitasDeHoy() {
    List<Cita> citas = citaService.findCitasDeHoy();
        List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE') or hasRole('VETERINARIO')")
    public ResponseEntity<?> createCita(@RequestBody Cita cita) {
        try {
            System.out.println("=== Creando cita ===");
            System.out.println("Cliente documento: " + (cita.getCliente() != null ? cita.getCliente().getDocumento() : "null"));
            System.out.println("Mascota ID: " + (cita.getMascota() != null ? cita.getMascota().getId() : "null"));
            
            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            // Verificar si el usuario tiene rol VETERINARIO
            boolean isVeterinario = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            
            // Validar y obtener cliente
            if (cita.getCliente() == null || cita.getCliente().getDocumento() == null) {
                return ResponseEntity.badRequest().body("Cliente requerido");
            }
            
            Optional<Usuario> clienteOpt = usuarioService.findById(cita.getCliente().getDocumento());
            if (!clienteOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Cliente no encontrado");
            }
            cita.setCliente(clienteOpt.get());
            
            // Validar y obtener mascota
            if (cita.getMascota() == null || cita.getMascota().getId() == null) {
                return ResponseEntity.badRequest().body("Mascota requerida");
            }
            
            Optional<Mascota> mascotaOpt = mascotaService.findById(cita.getMascota().getId());
            if (!mascotaOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Mascota no encontrada");
            }
            cita.setMascota(mascotaOpt.get());
            
            // Si es veterinario, asignarlo automáticamente
            if (isVeterinario) {
                Optional<Usuario> veterinario = usuarioService.findByUsername(username);
                if (veterinario.isPresent()) {
                    cita.setVeterinario(veterinario.get());
                    System.out.println("=== Veterinario auto-asignado: " + veterinario.get().getNombres() + " " + veterinario.get().getApellidos());
                }
            } else {
                // Si no es veterinario, validar y obtener veterinario del request (opcional)
                if (cita.getVeterinario() != null && cita.getVeterinario().getDocumento() != null) {
                    Optional<Usuario> veterinarioOpt = usuarioService.findById(cita.getVeterinario().getDocumento());
                    cita.setVeterinario(veterinarioOpt.orElse(null));
                }
            }
            
            // Validar y obtener veterinaria (opcional)
            if (cita.getVeterinaria() != null && cita.getVeterinaria().getId() != null) {
                Optional<Veterinaria> veterinariaOpt = veterinariaService.findById(cita.getVeterinaria().getId());
                cita.setVeterinaria(veterinariaOpt.orElse(null));
            }
            
            Cita savedCita = citaService.save(cita);
            return ResponseEntity.ok(new CitaResponse(savedCita));
        } catch (Exception e) {
            System.err.println("Error creating cita: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al crear la cita: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Cita> updateCita(@PathVariable Long id, @RequestBody Cita cita) {
        Optional<Cita> existingCita = citaService.findById(id);
        if (existingCita.isPresent()) {
            cita.setId(id);
            Cita updatedCita = citaService.update(cita);
            return ResponseEntity.ok(updatedCita);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCita(@PathVariable Long id) {
        citaService.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or @citaService.findById(#id).orElse(null)?.cliente?.username == authentication.name")
    public ResponseEntity<Cita> cancelarCita(@PathVariable Long id) {
        try {
            Cita cita = citaService.cancelarCita(id);
            return ResponseEntity.ok(cita);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Cita> confirmarCita(@PathVariable Long id) {
        try {
            Cita cita = citaService.confirmarCita(id);
            return ResponseEntity.ok(cita);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/completar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<Cita> completarCita(@PathVariable Long id) {
        try {
            Cita cita = citaService.completarCita(id);
            return ResponseEntity.ok(cita);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Cita> cambiarEstado(@PathVariable Long id, @RequestParam EstadoCita estado) {
        try {
            Optional<Cita> citaOptional = citaService.findById(id);
            if (citaOptional.isPresent()) {
                Cita cita = citaOptional.get();
                cita.setEstado(estado);
                Cita updatedCita = citaService.save(cita);
                return ResponseEntity.ok(updatedCita);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error changing cita status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}