package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.*;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.service.CSVExportService;
import com.veterinaria.veterinaria.service.GestionReporteService;
import com.veterinaria.veterinaria.service.PDFExportService;
import com.veterinaria.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
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
    public ResponseEntity<List<ReporteUsuarioDTO>> getReporteUsuarios(
            @RequestParam(required = false) Long veterinariaId) {
        List<ReporteUsuarioDTO> reporte;
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
        } else {
            reporte = gestionReporteService.getReporteUsuarios();
        }
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/usuarios/estadisticas")
    public ResponseEntity<EstadisticasUsuariosDTO> getEstadisticasUsuarios(
            @RequestParam(required = false) Long veterinariaId) {
        EstadisticasUsuariosDTO estadisticas;
        if (veterinariaId != null) {
            estadisticas = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(veterinariaId);
        } else {
            estadisticas = gestionReporteService.getEstadisticasUsuarios();
        }
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
    public ResponseEntity<List<ReporteMascotaDTO>> getReporteMascotas(
            @RequestParam(required = false) Long veterinariaId) {
        List<ReporteMascotaDTO> reporte;
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
        } else {
            reporte = gestionReporteService.getReporteMascotas();
        }
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/mascotas/estadisticas")
    public ResponseEntity<EstadisticasMascotasDTO> getEstadisticasMascotas(
            @RequestParam(required = false) Long veterinariaId) {
        EstadisticasMascotasDTO estadisticas;
        if (veterinariaId != null) {
            estadisticas = gestionReporteService.getEstadisticasMascotasPorVeterinaria(veterinariaId);
        } else {
            estadisticas = gestionReporteService.getEstadisticasMascotas();
        }
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
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitas(
            @RequestParam(required = false) Long veterinariaId) {
        List<ReporteCitaDTO> reporte;
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
        } else {
            reporte = gestionReporteService.getReporteCitas();
        }
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/citas/estadisticas")
    public ResponseEntity<EstadisticasCitasDTO> getEstadisticasCitas(
            @RequestParam(required = false) Long veterinariaId) {
        EstadisticasCitasDTO estadisticas;
        if (veterinariaId != null) {
            estadisticas = gestionReporteService.getEstadisticasCitasPorVeterinaria(veterinariaId);
        } else {
            estadisticas = gestionReporteService.getEstadisticasCitas();
        }
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
            @RequestParam String fechaFin,
            @RequestParam(required = false) Long veterinariaId) {
        // Convertir las fechas String a LocalDateTime (inicio del día y fin del día)
        LocalDateTime inicio = LocalDate.parse(fechaInicio).atStartOfDay();
        LocalDateTime fin = LocalDate.parse(fechaFin).atTime(23, 59, 59);
        
        List<ReporteCitaDTO> reporte;
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteCitasPorFechaYVeterinaria(inicio, fin, veterinariaId);
        } else {
            reporte = gestionReporteService.getReporteCitasPorFecha(inicio, fin);
        }
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE EXPORTACIÓN CSV ====================
    
    @GetMapping("/usuarios/export/csv")
    public ResponseEntity<byte[]> exportarReporteUsuariosCSV(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String search) {
        List<ReporteUsuarioDTO> usuarios;
        
        // Obtener usuarios según los filtros
        if (veterinariaId != null) {
            usuarios = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
        } else {
            usuarios = gestionReporteService.getReporteUsuarios();
        }
        
        // Aplicar filtro por rol si está presente
        if (rol != null && !rol.isEmpty()) {
            String rolFiltro = rol.startsWith("ROLE_") ? rol : "ROLE_" + rol;
            usuarios = usuarios.stream()
                    .filter(u -> u.getRol().equals(rolFiltro))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            usuarios = usuarios.stream()
                    .filter(u -> 
                        u.getUsername().toLowerCase().contains(searchLower) ||
                        (u.getNombres() != null && u.getNombres().toLowerCase().contains(searchLower)) ||
                        (u.getApellidos() != null && u.getApellidos().toLowerCase().contains(searchLower)) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                        u.getDocumento().toLowerCase().contains(searchLower)
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        byte[] csvBytes = csvExportService.exportarUsuariosCSV(usuarios);
        
        String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/mascotas/export/csv")
    public ResponseEntity<byte[]> exportarReporteMascotasCSV(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) String search) {
        List<ReporteMascotaDTO> mascotas;
        
        // Obtener mascotas según los filtros
        if (veterinariaId != null) {
            mascotas = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
        } else {
            mascotas = gestionReporteService.getReporteMascotas();
        }
        
        // Aplicar filtro por especie si está presente
        if (especie != null && !especie.isEmpty()) {
            mascotas = mascotas.stream()
                    .filter(m -> m.getEspecie().equalsIgnoreCase(especie))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            mascotas = mascotas.stream()
                    .filter(m -> 
                        m.getNombre().toLowerCase().contains(searchLower) ||
                        (m.getPropietarioNombre() != null && m.getPropietarioNombre().toLowerCase().contains(searchLower)) ||
                        (m.getPropietarioApellido() != null && m.getPropietarioApellido().toLowerCase().contains(searchLower)) ||
                        (m.getRaza() != null && m.getRaza().toLowerCase().contains(searchLower))
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        byte[] csvBytes = csvExportService.exportarMascotasCSV(mascotas);
        
        String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/citas/export/csv")
    public ResponseEntity<byte[]> exportarReporteCitasCSV(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        List<ReporteCitaDTO> citas;
        
        // Obtener citas según los filtros
        if (veterinariaId != null) {
            citas = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
        } else {
            citas = gestionReporteService.getReporteCitas();
        }
        
        // Aplicar filtro por estado si está presente
        if (estado != null && !estado.isEmpty()) {
            citas = citas.stream()
                    .filter(c -> c.getEstado().equals(estado))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            citas = citas.stream()
                    .filter(c -> 
                        (c.getClienteNombre() != null && c.getClienteNombre().toLowerCase().contains(searchLower)) ||
                        (c.getMascotaNombre() != null && c.getMascotaNombre().toLowerCase().contains(searchLower)) ||
                        (c.getVeterinarioNombre() != null && c.getVeterinarioNombre().toLowerCase().contains(searchLower)) ||
                        (c.getMotivo() != null && c.getMotivo().toLowerCase().contains(searchLower))
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro por rango de fechas si están presentes
        if (fechaInicio != null && !fechaInicio.isEmpty() && fechaFin != null && !fechaFin.isEmpty()) {
            try {
                LocalDate inicio = LocalDate.parse(fechaInicio);
                LocalDate fin = LocalDate.parse(fechaFin);
                citas = citas.stream()
                        .filter(c -> {
                            try {
                                if (c.getFechaHora() != null) {
                                    LocalDate fechaCitaDate = c.getFechaHora().toLocalDate();
                                    return !fechaCitaDate.isBefore(inicio) && !fechaCitaDate.isAfter(fin);
                                }
                                return false;
                            } catch (Exception e) {
                                return false;
                            }
                        })
                        .collect(java.util.stream.Collectors.toList());
            } catch (Exception e) {
                // Si hay error al parsear fechas, ignorar el filtro de fechas
            }
        }
        
        byte[] csvBytes = csvExportService.exportarCitasCSV(citas);
        
        String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    // ==================== ENDPOINTS DE EXPORTACIÓN PDF ====================
    
    @GetMapping("/usuarios/export/pdf")
    public ResponseEntity<byte[]> exportarReporteUsuariosPDF(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String search) {
        List<ReporteUsuarioDTO> usuarios;
        EstadisticasUsuariosDTO estadisticas;
        
        if (veterinariaId != null) {
            usuarios = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
            estadisticas = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(veterinariaId);
        } else {
            usuarios = gestionReporteService.getReporteUsuarios();
            estadisticas = gestionReporteService.getEstadisticasUsuarios();
        }
        
        // Aplicar filtro por rol si está presente
        if (rol != null && !rol.isEmpty()) {
            String rolFiltro = rol.startsWith("ROLE_") ? rol : "ROLE_" + rol;
            usuarios = usuarios.stream()
                    .filter(u -> u.getRol().equals(rolFiltro))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            usuarios = usuarios.stream()
                    .filter(u -> 
                        u.getUsername().toLowerCase().contains(searchLower) ||
                        (u.getNombres() != null && u.getNombres().toLowerCase().contains(searchLower)) ||
                        (u.getApellidos() != null && u.getApellidos().toLowerCase().contains(searchLower)) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                        u.getDocumento().toLowerCase().contains(searchLower)
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        byte[] pdfBytes = pdfExportService.generarReporteUsuariosPDF(usuarios, estadisticas);
        
        String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("application/pdf"))
                .body(pdfBytes);
    }

    @GetMapping("/mascotas/export/pdf")
    public ResponseEntity<byte[]> exportarReporteMascotasPDF(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) String search) {
        List<ReporteMascotaDTO> mascotas;
        EstadisticasMascotasDTO estadisticas;
        
        if (veterinariaId != null) {
            mascotas = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
            estadisticas = gestionReporteService.getEstadisticasMascotasPorVeterinaria(veterinariaId);
        } else {
            mascotas = gestionReporteService.getReporteMascotas();
            estadisticas = gestionReporteService.getEstadisticasMascotas();
        }
        
        // Aplicar filtro por especie si está presente
        if (especie != null && !especie.isEmpty()) {
            mascotas = mascotas.stream()
                    .filter(m -> m.getEspecie().equalsIgnoreCase(especie))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            mascotas = mascotas.stream()
                    .filter(m -> 
                        m.getNombre().toLowerCase().contains(searchLower) ||
                        (m.getPropietarioNombre() != null && m.getPropietarioNombre().toLowerCase().contains(searchLower)) ||
                        (m.getPropietarioApellido() != null && m.getPropietarioApellido().toLowerCase().contains(searchLower)) ||
                        (m.getRaza() != null && m.getRaza().toLowerCase().contains(searchLower))
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        byte[] pdfBytes = pdfExportService.generarReporteMascotasPDF(mascotas, estadisticas);
        
        String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("application/pdf"))
                .body(pdfBytes);
    }

    @GetMapping("/citas/export/pdf")
    public ResponseEntity<byte[]> exportarReporteCitasPDF(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        List<ReporteCitaDTO> citas;
        EstadisticasCitasDTO estadisticas;
        
        if (veterinariaId != null) {
            citas = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
            estadisticas = gestionReporteService.getEstadisticasCitasPorVeterinaria(veterinariaId);
        } else {
            citas = gestionReporteService.getReporteCitas();
            estadisticas = gestionReporteService.getEstadisticasCitas();
        }
        
        // Aplicar filtro por estado si está presente
        if (estado != null && !estado.isEmpty()) {
            citas = citas.stream()
                    .filter(c -> c.getEstado().equals(estado))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro de búsqueda si está presente
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            citas = citas.stream()
                    .filter(c -> 
                        (c.getClienteNombre() != null && c.getClienteNombre().toLowerCase().contains(searchLower)) ||
                        (c.getMascotaNombre() != null && c.getMascotaNombre().toLowerCase().contains(searchLower)) ||
                        (c.getVeterinarioNombre() != null && c.getVeterinarioNombre().toLowerCase().contains(searchLower)) ||
                        (c.getMotivo() != null && c.getMotivo().toLowerCase().contains(searchLower))
                    )
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Aplicar filtro por rango de fechas si están presentes
        if (fechaInicio != null && !fechaInicio.isEmpty() && fechaFin != null && !fechaFin.isEmpty()) {
            try {
                LocalDate inicio = LocalDate.parse(fechaInicio);
                LocalDate fin = LocalDate.parse(fechaFin);
                citas = citas.stream()
                        .filter(c -> {
                            try {
                                if (c.getFechaHora() != null) {
                                    LocalDate fechaCitaDate = c.getFechaHora().toLocalDate();
                                    return !fechaCitaDate.isBefore(inicio) && !fechaCitaDate.isAfter(fin);
                                }
                                return false;
                            } catch (Exception e) {
                                return false;
                            }
                        })
                        .collect(java.util.stream.Collectors.toList());
            } catch (Exception e) {
                // Si hay error al parsear fechas, ignorar el filtro de fechas
            }
        }
        
        byte[] pdfBytes = pdfExportService.generarReporteCitasPDF(citas, estadisticas);
        
        String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("application/pdf"))
                .body(pdfBytes);
    }
}
