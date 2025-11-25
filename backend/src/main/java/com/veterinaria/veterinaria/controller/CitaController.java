package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.CitaRequest;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or hasRole('CLIENTE')")
    public ResponseEntity<List<CitaResponse>> getAllCitas() {
        try {
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
            boolean isCliente = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
            
            List<Cita> citas;
            
            if (isCliente) {
                // Si es cliente, obtener solo sus citas
                citas = citaService.findByClienteDocumento(usuarioAutenticado.getDocumento());
                System.out.println("=== DEBUG: Cliente " + username + " consultando sus citas: " + citas.size());
            } else if (isVeterinario) {
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
        } catch (Exception e) {
            System.err.println("❌ Error al obtener citas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Devolver lista vacía en lugar de error 500
        }
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
    public ResponseEntity<?> createCita(@RequestBody CitaRequest request) {
        try {
            System.out.println("=== Creando cita ===");
            System.out.println("Cliente documento: " + request.getClienteDocumento());
            System.out.println("Mascota ID: " + request.getMascotaId());
            System.out.println("FechaHora: " + request.getFechaHora());
            
            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Usuario usuarioAutenticado = usuarioService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Verificar si el usuario tiene rol VETERINARIO
            boolean isVeterinario = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            
            // Crear la entidad Cita
            Cita cita = new Cita();
            cita.setFechaHora(request.getFechaHora());
            cita.setMotivo(request.getMotivo());
            cita.setObservaciones(request.getObservaciones());
            cita.setEstado(request.getEstado() != null ? request.getEstado() : Cita.EstadoCita.PROGRAMADA);
            
            // Validar y obtener cliente
            Usuario cliente = usuarioService.findById(request.getClienteDocumento())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            cita.setCliente(cliente);
            
            // Validar y obtener mascota
            Mascota mascota = mascotaService.findById(request.getMascotaId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
            cita.setMascota(mascota);
            
            // Si es veterinario, asignarlo automáticamente
            if (isVeterinario) {
                cita.setVeterinario(usuarioAutenticado);
                System.out.println("=== Veterinario auto-asignado: " + usuarioAutenticado.getNombres() + " " + usuarioAutenticado.getApellidos());
            } else if (request.getVeterinarioDocumento() != null && !request.getVeterinarioDocumento().isEmpty()) {
                // Si no es veterinario, obtener veterinario del request (opcional)
                Optional<Usuario> veterinarioOpt = usuarioService.findById(request.getVeterinarioDocumento());
                cita.setVeterinario(veterinarioOpt.orElse(null));
            }
            
            // Obtener veterinaria: usar la del request, o la del usuario autenticado
            Long veterinariaId = null;
            if (request.getVeterinariaId() != null) {
                Optional<Veterinaria> veterinariaOpt = veterinariaService.findById(request.getVeterinariaId());
                if (veterinariaOpt.isPresent()) {
                    cita.setVeterinaria(veterinariaOpt.get());
                    veterinariaId = veterinariaOpt.get().getId();
                }
            } else if (usuarioAutenticado.getVeterinaria() != null) {
                cita.setVeterinaria(usuarioAutenticado.getVeterinaria());
                veterinariaId = usuarioAutenticado.getVeterinaria().getId();
                System.out.println("=== Veterinaria auto-asignada: " + usuarioAutenticado.getVeterinaria().getNombre());
            }
            
            // VALIDAR DISPONIBILIDAD DE HORARIO
            if (veterinariaId != null && !citaService.isHorarioDisponible(request.getFechaHora(), veterinariaId)) {
                return ResponseEntity.badRequest().body("El horario seleccionado ya está ocupado. Por favor, elija otro horario.");
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or hasRole('CLIENTE')")
    public ResponseEntity<Cita> cambiarEstado(@PathVariable Long id, @RequestParam EstadoCita estado) {
        try {
            Optional<Cita> citaOptional = citaService.findById(id);
            if (citaOptional.isPresent()) {
                Cita cita = citaOptional.get();
                
                // Si es CLIENTE, solo puede cancelar sus propias citas
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isCliente = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_CLIENTE"));
                
                if (isCliente) {
                    // Verificar que la cita le pertenece
                    if (!cita.getCliente().getUsername().equals(authentication.getName())) {
                        return ResponseEntity.status(403).build();
                    }
                    // Solo puede cancelar
                    if (estado != EstadoCita.CANCELADA) {
                        return ResponseEntity.status(403).build();
                    }
                }
                
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
    
    @GetMapping("/disponibilidad")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE') or hasRole('VETERINARIO')")
    public ResponseEntity<?> getHorariosDisponibles(
            @RequestParam("fecha") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate fecha,
            @RequestParam("veterinariaId") Long veterinariaId) {
        try {
            List<com.veterinaria.veterinaria.dto.HorarioDisponibleDTO> horarios = citaService.getHorariosDisponibles(fecha, veterinariaId);
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener horarios disponibles: " + e.getMessage());
        }
    }
    
    @GetMapping("/dia")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<?> getCitasDelDia(
            @RequestParam("fecha") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate fecha,
            @RequestParam("veterinariaId") Long veterinariaId) {
        try {
            List<Cita> citas = citaService.getCitasDelDia(fecha, veterinariaId);
            List<CitaResponse> response = citas.stream()
                .map(CitaResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener citas del día: " + e.getMessage());
        }
    }
}