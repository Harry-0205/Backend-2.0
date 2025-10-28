package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.HistoriaClinica;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.dto.HistoriaClinicaResponse;
import com.veterinaria.veterinaria.service.HistoriaClinicaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.MascotaService;
import com.veterinaria.veterinaria.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<HistoriaClinicaResponse>> getAllHistorias() {
        List<HistoriaClinica> historias = historiaClinicaService.findAll();
        List<HistoriaClinicaResponse> response = historias.stream()
                .map(HistoriaClinicaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
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
    public ResponseEntity<HistoriaClinicaResponse> createHistoria(@RequestBody HistoriaClinica historia) {
        try {
            // Validar y obtener mascota (requerida)
            if (historia.getMascota() != null && historia.getMascota().getId() != null) {
                Optional<Mascota> mascota = mascotaService.findById(historia.getMascota().getId());
                if (mascota.isPresent()) {
                    historia.setMascota(mascota.get());
                } else {
                    System.err.println("Mascota no encontrada con ID: " + historia.getMascota().getId());
                    return ResponseEntity.badRequest().build(); // Mascota no encontrada
                }
            } else {
                System.err.println("Mascota requerida pero no proporcionada");
                return ResponseEntity.badRequest().build(); // Mascota requerida
            }
            
            // Validar y obtener veterinario (requerido)
            if (historia.getVeterinario() != null && historia.getVeterinario().getDocumento() != null) {
                Optional<Usuario> veterinario = usuarioService.findById(historia.getVeterinario().getDocumento());
                if (veterinario.isPresent()) {
                    historia.setVeterinario(veterinario.get());
                } else {
                    System.err.println("Veterinario no encontrado con documento: " + historia.getVeterinario().getDocumento());
                    return ResponseEntity.badRequest().build(); // Veterinario no encontrado
                }
            } else {
                System.err.println("Veterinario requerido pero no proporcionado");
                return ResponseEntity.badRequest().build(); // Veterinario requerido
            }
            
            // Validar y obtener cita (opcional)
            if (historia.getCita() != null && historia.getCita().getId() != null) {
                Optional<Cita> cita = citaService.findById(historia.getCita().getId());
                if (cita.isPresent()) {
                    historia.setCita(cita.get());
                } else {
                    historia.setCita(null); // Cita no encontrada, dejar nulo
                }
            }
            
            HistoriaClinica nuevaHistoria = historiaClinicaService.save(historia);
            return ResponseEntity.ok(new HistoriaClinicaResponse(nuevaHistoria));
        } catch (Exception e) {
            System.err.println("Error creating historia clinica: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<?> updateHistoria(@PathVariable Long id, @RequestBody HistoriaClinica historiaDetails) {
        try {
            System.out.println("=== Actualizando historia clínica ID: " + id + " ===");
            Optional<HistoriaClinica> optionalHistoria = historiaClinicaService.findById(id);
            
            if (!optionalHistoria.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            HistoriaClinica historia = optionalHistoria.get();
            
            // Actualizar todos los campos
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
            System.out.println("Historia clínica actualizada exitosamente");
            return ResponseEntity.ok(new HistoriaClinicaResponse(historiaActualizada));
        } catch (Exception e) {
            System.err.println("Error updating historia clinica: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al actualizar la historia clínica: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<Void> deleteHistoria(@PathVariable Long id) {
        Optional<HistoriaClinica> optionalHistoria = historiaClinicaService.findById(id);
        
        if (optionalHistoria.isPresent()) {
            HistoriaClinica historia = optionalHistoria.get();
            
            // Desasociar la cita antes de eliminar para evitar problemas de FK
            if (historia.getCita() != null) {
                historia.setCita(null);
                historiaClinicaService.save(historia);
            }
            
            historiaClinicaService.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}