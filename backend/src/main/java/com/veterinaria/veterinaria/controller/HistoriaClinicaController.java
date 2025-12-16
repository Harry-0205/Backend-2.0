package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.HistoriaClinica;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.dto.HistoriaClinicaResponse;
import com.veterinaria.veterinaria.dto.HistoriaClinicaRequest;
import com.veterinaria.veterinaria.dto.ApiResponse;
import com.veterinaria.veterinaria.service.HistoriaClinicaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.MascotaService;
import com.veterinaria.veterinaria.service.CitaService;
import com.veterinaria.veterinaria.service.VeterinariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/historias-clinicas")
public class HistoriaClinicaController {
    
    @Autowired
    private HistoriaClinicaService historiaClinicaService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private CitaService citaService;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE')")
    public ResponseEntity<List<HistoriaClinicaResponse>> getAllHistorias() {
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
            
            List<HistoriaClinica> historias;
            
            if (isCliente) {
                // Si es cliente, obtener historias de sus mascotas
                historias = historiaClinicaService.findByPropietarioDocumento(usuarioAutenticado.getDocumento());
                System.out.println("=== DEBUG: Cliente " + username + " consultando historias de sus mascotas: " + historias.size());
            } else if (isVeterinario) {
                // Si es veterinario, obtener solo sus historias clínicas activas (no archivadas)
                historias = historiaClinicaService.findByVeterinarioDocumento(usuarioAutenticado.getDocumento());
                System.out.println("=== DEBUG: Veterinario " + username + " total historias antes de filtrar: " + historias.size());
                
                // Mostrar estado de cada historia
                for (HistoriaClinica h : historias) {
                    System.out.println("  Historia ID " + h.getId() + " - activo: " + h.getActivo());
                }
                
                // Filtrar EXCLUYENDO las archivadas (activo = false)
                // NULL o true se consideran activas
                historias = historias.stream()
                    .filter(h -> {
                        boolean esArchivada = h.getActivo() != null && !h.getActivo();
                        if (esArchivada) {
                            System.out.println("  ❌ Filtrando historia archivada ID: " + h.getId());
                        }
                        return !esArchivada; // Retornar las que NO están archivadas
                    })
                    .collect(java.util.stream.Collectors.toList());
                System.out.println("=== DEBUG: Veterinario " + username + " historias activas después de filtrar: " + historias.size());
            } else if (isAdmin) {
                // Admin ve historias de todas las veterinarias que creó
                List<Long> veterinariaIds = new ArrayList<>();
                List<Veterinaria> veterinariasDelAdmin = veterinariaService.findByCreadoPorDocumento(usuarioAutenticado.getDocumento());
                veterinariasDelAdmin.forEach(v -> veterinariaIds.add(v.getId()));
                
                historias = new ArrayList<>();
                for (Long vetId : veterinariaIds) {
                    List<HistoriaClinica> historiasDeVet = historiaClinicaService.findByVeterinariaId(vetId);
                    for (HistoriaClinica h : historiasDeVet) {
                        if (!historias.contains(h)) {
                            historias.add(h);
                        }
                    }
                }
                System.out.println("=== DEBUG: Admin " + username + 
                    " consultando historias de " + veterinariaIds.size() + " veterinarias: " + historias.size() + " historias");
                
                // Debug: mostrar detalles de cada historia
                for (HistoriaClinica h : historias) {
                    System.out.println("  - Historia ID " + h.getId() + 
                                     ", Mascota: " + (h.getMascota() != null ? h.getMascota().getNombre() : "null") +
                                     ", Veterinario: " + (h.getVeterinario() != null ? h.getVeterinario().getNombres() : "null") +
                                     ", Activo: " + h.getActivo());
                }
            } else if (isRecepcionista) {
                // Recepcionista ve solo las historias de su veterinaria
                System.out.println("=== DEBUG HISTORIAS: Usuario " + username + " tiene veterinaria? " + (usuarioAutenticado.getVeterinaria() != null));
                
                if (usuarioAutenticado.getVeterinaria() != null) {
                    Long veterinariaId = usuarioAutenticado.getVeterinaria().getId();
                    System.out.println("=== DEBUG HISTORIAS: Buscando historias para veterinaria ID: " + veterinariaId);
                    System.out.println("=== DEBUG HISTORIAS: Nombre veterinaria: " + usuarioAutenticado.getVeterinaria().getNombre());
                    
                    historias = historiaClinicaService.findByVeterinariaId(veterinariaId);
                    
                    System.out.println("=== DEBUG: Recepcionista " + username + 
                        " consultando historias de veterinaria ID " + veterinariaId + ": " + historias.size() + " historias");
                    
                    // Debug: mostrar detalles de cada historia
                    for (HistoriaClinica h : historias) {
                        System.out.println("  - Historia ID " + h.getId() + 
                                         ", Mascota: " + (h.getMascota() != null ? h.getMascota().getNombre() : "null") +
                                         ", Veterinario: " + (h.getVeterinario() != null ? h.getVeterinario().getNombres() : "null") +
                                         ", Activo: " + h.getActivo());
                    }
                } else {
                    // Si no tiene veterinaria asignada, no puede ver ninguna historia
                    historias = List.of();
                    System.out.println("=== DEBUG ALERTA HISTORIAS: Recepcionista " + username + 
                        " sin veterinaria asignada! Documento: " + usuarioAutenticado.getDocumento());
                }
            } else {
                historias = List.of();
            }
            
            List<HistoriaClinicaResponse> response = historias.stream()
                    .map(HistoriaClinicaResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error al obtener historias clínicas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Devolver lista vacía en lugar de error 500
        }
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<Page<HistoriaClinica>> getAllHistorias(Pageable pageable) {
        Page<HistoriaClinica> historias = historiaClinicaService.findAll(pageable);
        return ResponseEntity.ok(historias);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA') or @historiaClinicaService.findById(#id).orElse(null)?.mascota?.propietario?.username == authentication.name")
    public ResponseEntity<HistoriaClinicaResponse> getHistoriaById(@PathVariable Long id) {
        Optional<HistoriaClinica> historia = historiaClinicaService.findById(id);
        return historia.map(h -> ResponseEntity.ok(new HistoriaClinicaResponse(h)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/mascota/{mascotaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA') or @mascotaService.findById(#mascotaId).orElse(null)?.propietario?.username == authentication.name")
    public ResponseEntity<List<HistoriaClinicaResponse>> getHistoriasByMascota(@PathVariable Long mascotaId) {
        List<HistoriaClinica> historias = historiaClinicaService.findByMascotaId(mascotaId);
        List<HistoriaClinicaResponse> response = historias.stream()
                .map(HistoriaClinicaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/veterinario/{veterinarioDocumento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<HistoriaClinica>> getHistoriasByVeterinario(@PathVariable String veterinarioDocumento) {
        List<HistoriaClinica> historias = historiaClinicaService.findByVeterinarioDocumento(veterinarioDocumento);
        return ResponseEntity.ok(historias);
    }
      @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<HistoriaClinicaResponse> createHistoria(
            @RequestBody HistoriaClinicaRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            System.out.println("=== Creando historia clínica ===");
            System.out.println("MascotaId: " + request.getMascotaId());
            System.out.println("VeterinarioDocumento solicitado: " + request.getVeterinarioDocumento());
            System.out.println("Usuario autenticado: " + userDetails.getUsername());
            
            // Obtener el usuario autenticado
            Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(userDetails.getUsername());
            if (!usuarioAutenticadoOpt.isPresent()) {
                System.err.println("❌ Usuario autenticado no encontrado");
                return ResponseEntity.badRequest().build();
            }
            
            Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
            
            // Verificar si es veterinario
            boolean isVeterinario = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isRecepcionista = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
            
            HistoriaClinica historia = new HistoriaClinica();
            
            // Validar y obtener mascota (requerida)
            if (request.getMascotaId() != null) {
                Optional<Mascota> mascota = mascotaService.findById(request.getMascotaId());
                if (mascota.isPresent()) {
                    historia.setMascota(mascota.get());
                } else {
                    System.err.println("Mascota no encontrada con ID: " + request.getMascotaId());
                    return ResponseEntity.badRequest().build(); // Mascota no encontrada
                }
            } else {
                System.err.println("Mascota requerida pero no proporcionada");
                return ResponseEntity.badRequest().build(); // Mascota requerida
            }
            
            // Asignar veterinario según el rol
            if (isVeterinario) {
                // Si es VETERINARIO, SIEMPRE se asigna a sí mismo (ignora el veterinarioDocumento del request)
                historia.setVeterinario(usuarioAutenticado);
                System.out.println("✅ VETERINARIO: Asignado automáticamente a sí mismo - " + usuarioAutenticado.getNombres() + " (" + usuarioAutenticado.getDocumento() + ")");
                
                // Validar que no esté intentando asignar a otro veterinario
                if (request.getVeterinarioDocumento() != null && 
                    !request.getVeterinarioDocumento().equals(usuarioAutenticado.getDocumento())) {
                    System.out.println("⚠️ ADVERTENCIA: Veterinario " + usuarioAutenticado.getDocumento() + 
                        " intentó asignar historia a otro veterinario (" + request.getVeterinarioDocumento() + "). Se ignoró y se asignó a sí mismo.");
                }
            } else if (isAdmin || isRecepcionista) {
                // Admin o Recepcionista pueden asignar a cualquier veterinario
                if (request.getVeterinarioDocumento() != null) {
                    Optional<Usuario> veterinario = usuarioService.findById(request.getVeterinarioDocumento());
                    if (veterinario.isPresent()) {
                        // Verificar que el usuario asignado sea realmente veterinario
                        boolean esVeterinario = veterinario.get().getRoles().stream()
                            .anyMatch(rol -> rol.getNombre().equals("ROLE_VETERINARIO"));
                        
                        if (esVeterinario) {
                            historia.setVeterinario(veterinario.get());
                            System.out.println("✅ " + (isAdmin ? "ADMIN" : "RECEPCIONISTA") + 
                                ": Asignado veterinario - " + veterinario.get().getNombres() + " (" + request.getVeterinarioDocumento() + ")");
                        } else {
                            System.err.println("❌ El usuario con documento " + request.getVeterinarioDocumento() + " no tiene rol de veterinario");
                            return ResponseEntity.badRequest().build();
                        }
                    } else {
                        System.err.println("Veterinario no encontrado con documento: " + request.getVeterinarioDocumento());
                        return ResponseEntity.badRequest().build();
                    }
                } else {
                    System.err.println("Veterinario requerido pero no proporcionado");
                    return ResponseEntity.badRequest().build();
                }
            }
            
            // Validar y obtener cita (opcional)
            if (request.getCitaId() != null) {
                Optional<Cita> cita = citaService.findById(request.getCitaId());
                if (cita.isPresent()) {
                    historia.setCita(cita.get());
                }
            }
            
            // Establecer todos los campos del request
            historia.setFechaConsulta(request.getFechaConsulta());
            historia.setMotivoConsulta(request.getMotivoConsulta());
            historia.setSintomas(request.getSintomas());
            historia.setDiagnostico(request.getDiagnostico());
            historia.setTratamiento(request.getTratamiento());
            historia.setMedicamentos(request.getMedicamentos());
            historia.setPeso(request.getPeso());
            historia.setTemperatura(request.getTemperatura());
            historia.setFrecuenciaCardiaca(request.getFrecuenciaCardiaca());
            historia.setFrecuenciaRespiratoria(request.getFrecuenciaRespiratoria());
            historia.setObservaciones(request.getObservaciones());
            historia.setRecomendaciones(request.getRecomendaciones());
            
            HistoriaClinica nuevaHistoria = historiaClinicaService.save(historia);
            System.out.println("✅ Historia clínica creada con ID: " + nuevaHistoria.getId());
            return ResponseEntity.ok(new HistoriaClinicaResponse(nuevaHistoria));
        } catch (Exception e) {
            System.err.println("❌ Error creating historia clinica: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<?> updateHistoria(
            @PathVariable Long id, 
            @RequestBody HistoriaClinica historiaDetails,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            System.out.println("=== Actualizando historia clínica ID: " + id + " ===");
            Optional<HistoriaClinica> optionalHistoria = historiaClinicaService.findById(id);
            
            if (!optionalHistoria.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            HistoriaClinica historia = optionalHistoria.get();
            
            // Verificar roles del usuario autenticado
            boolean isVeterinario = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
            boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isRecepcionista = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_RECEPCIONISTA"));
            
            // Si es VETERINARIO, verificar que solo pueda editar sus propias historias
            if (isVeterinario) {
                Optional<Usuario> usuarioAutenticadoOpt = usuarioService.findByUsername(userDetails.getUsername());
                if (usuarioAutenticadoOpt.isPresent()) {
                    Usuario usuarioAutenticado = usuarioAutenticadoOpt.get();
                    
                    // Verificar que la historia pertenezca al veterinario autenticado
                    if (!historia.getVeterinario().getDocumento().equals(usuarioAutenticado.getDocumento())) {
                        System.err.println("❌ Veterinario " + usuarioAutenticado.getDocumento() + 
                            " intentó editar historia de otro veterinario (ID: " + id + ")");
                        return ResponseEntity.status(403).body("No tiene permisos para editar historias de otros veterinarios");
                    }
                    
                    // Los veterinarios NO pueden cambiar el veterinario asignado
                    if (historiaDetails.getVeterinario() != null && 
                        !historiaDetails.getVeterinario().getDocumento().equals(usuarioAutenticado.getDocumento())) {
                        System.out.println("⚠️ ADVERTENCIA: Veterinario intentó cambiar el veterinario asignado. Se ignoró.");
                        // No actualizar el veterinario, mantener el actual
                    }
                } else {
                    return ResponseEntity.status(401).body("Usuario autenticado no encontrado");
                }
            } else if (isAdmin || isRecepcionista) {
                // Admin y Recepcionista SÍ pueden cambiar el veterinario asignado
                if (historiaDetails.getVeterinario() != null) {
                    historia.setVeterinario(historiaDetails.getVeterinario());
                    System.out.println("✅ " + (isAdmin ? "ADMIN" : "RECEPCIONISTA") + 
                        ": Cambió veterinario a " + historiaDetails.getVeterinario().getDocumento());
                }
            }
            
            // Actualizar todos los campos (excepto veterinario si es VETERINARIO, ya se manejó arriba)
            if (historiaDetails.getFechaConsulta() != null) {
                historia.setFechaConsulta(historiaDetails.getFechaConsulta());
            }
            if (historiaDetails.getMotivoConsulta() != null) {
                historia.setMotivoConsulta(historiaDetails.getMotivoConsulta());
            }
            if (historiaDetails.getSintomas() != null) {
                historia.setSintomas(historiaDetails.getSintomas());
            }
            if (historiaDetails.getDiagnostico() != null) {
                historia.setDiagnostico(historiaDetails.getDiagnostico());
            }
            if (historiaDetails.getTratamiento() != null) {
                historia.setTratamiento(historiaDetails.getTratamiento());
            }
            if (historiaDetails.getObservaciones() != null) {
                historia.setObservaciones(historiaDetails.getObservaciones());
            }
            if (historiaDetails.getRecomendaciones() != null) {
                historia.setRecomendaciones(historiaDetails.getRecomendaciones());
            }
            if (historiaDetails.getMedicamentos() != null) {
                historia.setMedicamentos(historiaDetails.getMedicamentos());
            }
            if (historiaDetails.getPeso() != null) {
                historia.setPeso(historiaDetails.getPeso());
            }
            if (historiaDetails.getTemperatura() != null) {
                historia.setTemperatura(historiaDetails.getTemperatura());
            }
            if (historiaDetails.getFrecuenciaCardiaca() != null) {
                historia.setFrecuenciaCardiaca(historiaDetails.getFrecuenciaCardiaca());
            }
            if (historiaDetails.getFrecuenciaRespiratoria() != null) {
                historia.setFrecuenciaRespiratoria(historiaDetails.getFrecuenciaRespiratoria());
            }
            
            HistoriaClinica historiaActualizada = historiaClinicaService.save(historia);
            System.out.println("✅ Historia clínica actualizada exitosamente");
            return ResponseEntity.ok(new HistoriaClinicaResponse(historiaActualizada));
        } catch (Exception e) {
            System.err.println("❌ Error updating historia clinica: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al actualizar la historia clínica: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<?> deleteHistoria(@PathVariable Long id, Authentication authentication) {
        Optional<HistoriaClinica> optionalHistoria = historiaClinicaService.findById(id);
        
        if (optionalHistoria.isPresent()) {
            HistoriaClinica historia = optionalHistoria.get();
            
            // Verificar si el usuario es ADMIN
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (isAdmin) {
                // ADMIN puede eliminar físicamente
                if (historia.getCita() != null) {
                    historia.setCita(null);
                    historiaClinicaService.save(historia);
                }
                historiaClinicaService.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                // VETERINARIO solo puede archivar (cambiar activo a false)
                historia.setActivo(false);
                historiaClinicaService.save(historia);
                return ResponseEntity.ok().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<ApiResponse<HistoriaClinicaResponse>> activateHistoriaClinica(@PathVariable Long id) {
        try {
            HistoriaClinica historiaClinica = historiaClinicaService.activate(id);
            HistoriaClinicaResponse response = new HistoriaClinicaResponse(historiaClinica);
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Historia clínica activada exitosamente",
                response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage(),
                null
            ));
        }
    }
    
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<ApiResponse<HistoriaClinicaResponse>> deactivateHistoriaClinica(@PathVariable Long id) {
        try {
            HistoriaClinica historiaClinica = historiaClinicaService.deactivate(id);
            HistoriaClinicaResponse response = new HistoriaClinicaResponse(historiaClinica);
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Historia clínica desactivada exitosamente",
                response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage(),
                null
            ));
        }
    }
}