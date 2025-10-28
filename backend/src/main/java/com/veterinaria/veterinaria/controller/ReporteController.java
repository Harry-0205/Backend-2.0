package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Reporte;
import com.veterinaria.veterinaria.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        List<Reporte> reportes = reporteService.findByTipo(tipo);
        return ResponseEntity.ok(reportes);
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
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        try {
            Reporte reporte = reporteService.generarReporteCitas(fechaInicio, fechaFin);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/generar-mascotas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> generarReporteMascotas() {
        try {
            Reporte reporte = reporteService.generarReporteMascotas();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/generar-usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> generarReporteUsuarios() {
        try {
            Reporte reporte = reporteService.generarReporteUsuarios();
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
}