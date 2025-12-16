package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Reporte;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.service.ReporteService;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.VeterinariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    
    @Autowired
    private ReporteService reporteService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reporte>> getAllReportes() {
        List<Reporte> reportes = reporteService.findAll();
        return ResponseEntity.ok(reportes);
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Reporte>> getAllReportes(Pageable pageable) {
        Page<Reporte> reportes = reporteService.findAll(pageable);
        return ResponseEntity.ok(reportes);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> getReporteById(@PathVariable Long id) {
        Optional<Reporte> reporte = reporteService.findById(id);
        return reporte.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reporte>> getReportesByTipo(@PathVariable String tipo) {
        try {
            Reporte.TipoReporte tipoEnum = Reporte.TipoReporte.valueOf(tipo.toUpperCase());
            List<Reporte> reportes = reporteService.findByTipo(tipoEnum);
            return ResponseEntity.ok(reportes);
        } catch (IllegalArgumentException e) {
            // Tipo inválido: devolver 400 con mensaje claro
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/generado-por/{usuarioDocumento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reporte>> getReportesByGeneradoPor(@PathVariable String usuarioDocumento) {
        List<Reporte> reportes = reporteService.findByGeneradoPorDocumento(usuarioDocumento);
        return ResponseEntity.ok(reportes);
    }
    
    @GetMapping("/fecha-rango")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reporte>> getReportesByFechaRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        List<Reporte> reportes = reporteService.findByFechaGeneracionBetween(fechaInicio, fechaFin);
        return ResponseEntity.ok(reportes);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> createReporte(@Valid @RequestBody Reporte reporte) {
        try {
            Reporte nuevoReporte = reporteService.save(reporte);
            return ResponseEntity.ok(nuevoReporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/generar-citas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> generarReporteCitas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(required = false) Long veterinariaId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Validar permisos sobre la veterinaria
            if (veterinariaId != null && !validarAccesoVeterinaria(userDetails, veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            
            Reporte reporte = reporteService.generarReporteCitas(fechaInicio, fechaFin, veterinariaId);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/generar-mascotas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> generarReporteMascotas(
            @RequestParam(required = false) Long veterinariaId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Validar permisos sobre la veterinaria
            if (veterinariaId != null && !validarAccesoVeterinaria(userDetails, veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            
            Reporte reporte = reporteService.generarReporteMascotas(veterinariaId);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/generar-usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> generarReporteUsuarios(
            @RequestParam(required = false) Long veterinariaId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Validar permisos sobre la veterinaria
            if (veterinariaId != null && !validarAccesoVeterinaria(userDetails, veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            
            Reporte reporte = reporteService.generarReporteUsuarios(veterinariaId);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> updateReporte(@PathVariable Long id, @Valid @RequestBody Reporte reporteDetails) {
        Optional<Reporte> optionalReporte = reporteService.findById(id);
        
        if (optionalReporte.isPresent()) {
            Reporte reporte = optionalReporte.get();
            reporte.setTipo(reporteDetails.getTipo());
            reporte.setDescripcion(reporteDetails.getDescripcion());
            reporte.setContenido(reporteDetails.getContenido());
            
            Reporte reporteActualizado = reporteService.save(reporte);
            return ResponseEntity.ok(reporteActualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReporte(@PathVariable Long id) {
        Optional<Reporte> reporte = reporteService.findById(id);
        
        if (reporte.isPresent()) {
            reporteService.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Método auxiliar para validar acceso a veterinaria
    private boolean validarAccesoVeterinaria(org.springframework.security.core.userdetails.UserDetails userDetails, Long veterinariaId) {
        Optional<Usuario> usuarioOpt = usuarioService.findByUsername(userDetails.getUsername());
        if (!usuarioOpt.isPresent()) {
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Obtener todas las veterinarias accesibles por el admin (cadena completa)
        List<Long> veterinariaIds = new java.util.ArrayList<>();
        
        // Veterinarias creadas directamente por este admin
        List<Veterinaria> veterinariasDelAdmin = veterinariaService.findByCreadoPorDocumento(usuario.getDocumento());
        veterinariasDelAdmin.forEach(v -> veterinariaIds.add(v.getId()));
        
        // Recorrer cadena de creadores
        String documentoCreador = usuario.getCreadoPorDocumento();
        int nivel = 1;
        while (documentoCreador != null && nivel <= 10) {
            List<Veterinaria> veterinariasDelCreador = veterinariaService.findByCreadoPorDocumento(documentoCreador);
            for (Veterinaria vet : veterinariasDelCreador) {
                if (!veterinariaIds.contains(vet.getId())) {
                    veterinariaIds.add(vet.getId());
                }
            }
            
            Optional<Usuario> creadorOpt = usuarioService.findByDocumento(documentoCreador);
            if (creadorOpt.isPresent()) {
                documentoCreador = creadorOpt.get().getCreadoPorDocumento();
                nivel++;
            } else {
                documentoCreador = null;
            }
        }
        
        return veterinariaIds.contains(veterinariaId);
    }
}