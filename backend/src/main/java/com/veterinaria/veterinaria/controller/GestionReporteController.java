package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.*;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.service.CSVExportService;
import com.veterinaria.veterinaria.service.GestionReporteService;
import com.veterinaria.veterinaria.service.PDFExportService;
import com.veterinaria.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasRole('ADMIN')")
public class GestionReporteController {

    @Autowired
    private GestionReporteService gestionReporteService;

    @Autowired
    private CSVExportService csvExportService;

    @Autowired
    private PDFExportService pdfExportService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    /**
     * Obtiene el ID de la veterinaria del usuario autenticado (admin)
     */
    private Long getVeterinariaIdFromAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Usuario> usuarioOpt = usuarioService.findByUsername(username);
        if (usuarioOpt.isPresent() && usuarioOpt.get().getVeterinaria() != null) {
            return usuarioOpt.get().getVeterinaria().getId();
        }
        return null;
    }

    // ==================== ENDPOINTS DE REPORTES DE USUARIOS ====================

    @GetMapping("/usuarios")
    public ResponseEntity<List<ReporteUsuarioDTO>> getReporteUsuarios() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteUsuarioDTO> reporte = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/usuarios/estadisticas")
    public ResponseEntity<EstadisticasUsuariosDTO> getEstadisticasUsuarios() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(new EstadisticasUsuariosDTO(0L, 0L, 0L));
        }
        EstadisticasUsuariosDTO estadisticas = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/usuarios/rol/{rol}")
    public ResponseEntity<List<ReporteUsuarioDTO>> getReporteUsuariosPorRol(@PathVariable String rol) {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteUsuarioDTO> reporte = gestionReporteService.getReporteUsuariosPorRolYVeterinaria(rol, veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE REPORTES DE MASCOTAS ====================

    @GetMapping("/mascotas")
    public ResponseEntity<List<ReporteMascotaDTO>> getReporteMascotas() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteMascotaDTO> reporte = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/mascotas/estadisticas")
    public ResponseEntity<EstadisticasMascotasDTO> getEstadisticasMascotas() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(new EstadisticasMascotasDTO(0L));
        }
        EstadisticasMascotasDTO estadisticas = gestionReporteService.getEstadisticasMascotasPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/mascotas/especie/{especie}")
    public ResponseEntity<List<ReporteMascotaDTO>> getReporteMascotasPorEspecie(@PathVariable String especie) {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteMascotaDTO> reporte = gestionReporteService.getReporteMascotasPorEspecieYVeterinaria(especie, veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE REPORTES DE CITAS ====================

    @GetMapping("/citas")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitas() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteCitaDTO> reporte = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/citas/estadisticas")
    public ResponseEntity<EstadisticasCitasDTO> getEstadisticasCitas() {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(new EstadisticasCitasDTO());
        }
        EstadisticasCitasDTO estadisticas = gestionReporteService.getEstadisticasCitasPorVeterinaria(veterinariaId);
        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/citas/estado/{estado}")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitasPorEstado(@PathVariable String estado) {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ReporteCitaDTO> reporte = gestionReporteService.getReporteCitasPorEstadoYVeterinaria(estado, veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/citas/fecha")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitasPorFecha(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        Long veterinariaId = getVeterinariaIdFromAuthenticatedUser();
        if (veterinariaId == null) {
            return ResponseEntity.ok(List.of());
        }
        // Convertir las fechas String a LocalDateTime (inicio del día y fin del día)
        LocalDateTime inicio = LocalDate.parse(fechaInicio).atStartOfDay();
        LocalDateTime fin = LocalDate.parse(fechaFin).atTime(23, 59, 59);
        
        List<ReporteCitaDTO> reporte = gestionReporteService.getReporteCitasPorFechaYVeterinaria(inicio, fin, veterinariaId);
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE EXPORTACIÓN CSV ====================
    
    @GetMapping("/usuarios/export/csv")
    public ResponseEntity<byte[]> exportarReporteUsuariosCSV() {
        List<ReporteUsuarioDTO> usuarios = gestionReporteService.getReporteUsuarios();
        byte[] csvBytes = csvExportService.exportarUsuariosCSV(usuarios);
        
        String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/mascotas/export/csv")
    public ResponseEntity<byte[]> exportarReporteMascotasCSV() {
        List<ReporteMascotaDTO> mascotas = gestionReporteService.getReporteMascotas();
        byte[] csvBytes = csvExportService.exportarMascotasCSV(mascotas);
        
        String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/citas/export/csv")
    public ResponseEntity<byte[]> exportarReporteCitasCSV() {
        List<ReporteCitaDTO> citas = gestionReporteService.getReporteCitas();
        byte[] csvBytes = csvExportService.exportarCitasCSV(citas);
        
        String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    // ==================== ENDPOINTS DE EXPORTACIÓN PDF ====================
    
    @GetMapping("/usuarios/export/pdf")
    public ResponseEntity<byte[]> exportarReporteUsuariosPDF() {
        List<ReporteUsuarioDTO> usuarios = gestionReporteService.getReporteUsuarios();
        EstadisticasUsuariosDTO estadisticas = gestionReporteService.getEstadisticasUsuarios();
        byte[] pdfBytes = pdfExportService.generarReporteUsuariosPDF(usuarios, estadisticas);
        
        String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/mascotas/export/pdf")
    public ResponseEntity<byte[]> exportarReporteMascotasPDF() {
        List<ReporteMascotaDTO> mascotas = gestionReporteService.getReporteMascotas();
        EstadisticasMascotasDTO estadisticas = gestionReporteService.getEstadisticasMascotas();
        byte[] pdfBytes = pdfExportService.generarReporteMascotasPDF(mascotas, estadisticas);
        
        String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/citas/export/pdf")
    public ResponseEntity<byte[]> exportarReporteCitasPDF() {
        List<ReporteCitaDTO> citas = gestionReporteService.getReporteCitas();
        EstadisticasCitasDTO estadisticas = gestionReporteService.getEstadisticasCitas();
        byte[] pdfBytes = pdfExportService.generarReporteCitasPDF(citas, estadisticas);
        
        String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
