package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.*;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.service.CSVExportService;
import com.veterinaria.veterinaria.service.GestionReporteService;
import com.veterinaria.veterinaria.service.PDFExportService;
import com.veterinaria.veterinaria.service.UsuarioService;
import com.veterinaria.veterinaria.service.VeterinariaService;
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
import java.util.ArrayList;
import java.util.HashMap;
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
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    /**
     * Obtiene todos los IDs de las veterinarias que el admin puede gestionar:
     * 1. La veterinaria asignada al usuario (si tiene)
     * 2. Todas las veterinarias que el admin ha creado
     */
    private List<Long> getAllVeterinariasIdsFromAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Usuario> usuarioOpt = usuarioService.findByUsername(username);
        if (!usuarioOpt.isPresent()) {
            return List.of();
        }
        
        Usuario usuario = usuarioOpt.get();
        List<Long> veterinariasIds = new java.util.ArrayList<>();
        
        // Agregar la veterinaria asignada al usuario (si tiene)
        if (usuario.getVeterinaria() != null) {
            veterinariasIds.add(usuario.getVeterinaria().getId());
        }
        
        // Agregar todas las veterinarias creadas por este admin
        List<Veterinaria> veterinariasCreadas = veterinariaService.findByCreadoPorDocumento(usuario.getDocumento());
        for (Veterinaria vet : veterinariasCreadas) {
            if (!veterinariasIds.contains(vet.getId())) {
                veterinariasIds.add(vet.getId());
            }
        }
        
        return veterinariasIds;
    }

    // ==================== ENDPOINTS DE REPORTES DE USUARIOS ====================

    @GetMapping("/usuarios")
    public ResponseEntity<List<ReporteUsuarioDTO>> getReporteUsuarios(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener las veterinarias del usuario autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especifica una veterinaria y el admin tiene acceso a ella, usarla
        if (veterinariaId != null) {
            if (!veterinariasIds.contains(veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            List<ReporteUsuarioDTO> reporte = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
            return ResponseEntity.ok(reporte);
        }
        
        // Si no se especifica, devolver datos de todas las veterinarias del admin
        List<ReporteUsuarioDTO> reporteCompleto = new java.util.ArrayList<>();
        for (Long vetId : veterinariasIds) {
            reporteCompleto.addAll(gestionReporteService.getReporteUsuariosPorVeterinaria(vetId));
        }
        return ResponseEntity.ok(reporteCompleto);
    }

    @GetMapping("/usuarios/estadisticas")
    public ResponseEntity<EstadisticasUsuariosDTO> getEstadisticasUsuarios(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener las veterinarias del usuario autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias, devolver estadísticas vacías
        if (veterinariasIds.isEmpty()) {
            EstadisticasUsuariosDTO empty = new EstadisticasUsuariosDTO();
            empty.setTotalUsuarios(0L);
            empty.setTotalActivos(0L);
            empty.setTotalInactivos(0L);
            return ResponseEntity.ok(empty);
        }
        
        // Si se especifica una veterinaria y el admin tiene acceso a ella, usarla
        if (veterinariaId != null) {
            if (!veterinariasIds.contains(veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            EstadisticasUsuariosDTO estadisticas = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(veterinariaId);
            return ResponseEntity.ok(estadisticas);
        }
        
        // Si no se especifica, agregar estadísticas de todas las veterinarias del admin
        EstadisticasUsuariosDTO estadisticasGlobales = new EstadisticasUsuariosDTO();
        estadisticasGlobales.setTotalUsuarios(0L);
        estadisticasGlobales.setTotalActivos(0L);
        estadisticasGlobales.setTotalInactivos(0L);
        java.util.Map<String, Long> totalPorRolGlobal = new java.util.HashMap<>();
        
        for (Long vetId : veterinariasIds) {
            EstadisticasUsuariosDTO stats = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(vetId);
            estadisticasGlobales.setTotalUsuarios(estadisticasGlobales.getTotalUsuarios() + stats.getTotalUsuarios());
            estadisticasGlobales.setTotalActivos(estadisticasGlobales.getTotalActivos() + stats.getTotalActivos());
            estadisticasGlobales.setTotalInactivos(estadisticasGlobales.getTotalInactivos() + stats.getTotalInactivos());
            
            if (stats.getTotalPorRol() != null) {
                stats.getTotalPorRol().forEach((rol, total) -> {
                    totalPorRolGlobal.merge(rol, total, Long::sum);
                });
            }
        }
        estadisticasGlobales.setTotalPorRol(totalPorRolGlobal);
        return ResponseEntity.ok(estadisticasGlobales);
    }

    @GetMapping("/usuarios/rol/{rol}")
    public ResponseEntity<List<ReporteUsuarioDTO>> getReporteUsuariosPorRol(
            @PathVariable String rol,
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si no se especificó veterinaria, agregar datos de todas las veterinarias
        List<ReporteUsuarioDTO> reporte = new ArrayList<>();
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteUsuariosPorRolYVeterinaria(rol, veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                reporte.addAll(gestionReporteService.getReporteUsuariosPorRolYVeterinaria(rol, vetId));
            }
        }
        
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE REPORTES DE MASCOTAS ====================

    @GetMapping("/mascotas")
    public ResponseEntity<List<ReporteMascotaDTO>> getReporteMascotas(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener las veterinarias del usuario autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especifica una veterinaria y el admin tiene acceso a ella, usarla
        if (veterinariaId != null) {
            if (!veterinariasIds.contains(veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            List<ReporteMascotaDTO> reporte = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
            return ResponseEntity.ok(reporte);
        }
        
        // Si no se especifica, devolver datos de todas las veterinarias del admin
        List<ReporteMascotaDTO> reporteCompleto = new java.util.ArrayList<>();
        for (Long vetId : veterinariasIds) {
            reporteCompleto.addAll(gestionReporteService.getReporteMascotasPorVeterinaria(vetId));
        }
        return ResponseEntity.ok(reporteCompleto);
    }

    @GetMapping("/mascotas/estadisticas")
    public ResponseEntity<EstadisticasMascotasDTO> getEstadisticasMascotas(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener las veterinarias del usuario autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias, devolver estadísticas vacías
        if (veterinariasIds.isEmpty()) {
            EstadisticasMascotasDTO empty = new EstadisticasMascotasDTO();
            empty.setTotalMascotas(0L);
            return ResponseEntity.ok(empty);
        }
        
        // Si se especifica una veterinaria y el admin tiene acceso a ella, usarla
        if (veterinariaId != null) {
            if (!veterinariasIds.contains(veterinariaId)) {
                return ResponseEntity.status(403).build();
            }
            EstadisticasMascotasDTO estadisticas = gestionReporteService.getEstadisticasMascotasPorVeterinaria(veterinariaId);
            return ResponseEntity.ok(estadisticas);
        }
        
        // Si no se especifica, agregar estadísticas de todas las veterinarias del admin
        EstadisticasMascotasDTO estadisticasGlobales = new EstadisticasMascotasDTO();
        estadisticasGlobales.setTotalMascotas(0L);
        java.util.Map<String, Long> totalPorEspecieGlobal = new java.util.HashMap<>();
        java.util.Map<String, Long> totalPorSexoGlobal = new java.util.HashMap<>();
        double sumaEdades = 0;
        double sumaPesos = 0;
        int countEdades = 0;
        int countPesos = 0;
        
        for (Long vetId : veterinariasIds) {
            EstadisticasMascotasDTO stats = gestionReporteService.getEstadisticasMascotasPorVeterinaria(vetId);
            estadisticasGlobales.setTotalMascotas(estadisticasGlobales.getTotalMascotas() + stats.getTotalMascotas());
            
            if (stats.getTotalPorEspecie() != null) {
                stats.getTotalPorEspecie().forEach((especie, total) -> {
                    totalPorEspecieGlobal.merge(especie, total, Long::sum);
                });
            }
            
            if (stats.getTotalPorSexo() != null) {
                stats.getTotalPorSexo().forEach((sexo, total) -> {
                    totalPorSexoGlobal.merge(sexo, total, Long::sum);
                });
            }
            
            if (stats.getPromedioEdad() != null && stats.getPromedioEdad() > 0) {
                sumaEdades += stats.getPromedioEdad() * stats.getTotalMascotas();
                countEdades += stats.getTotalMascotas().intValue();
            }
            
            if (stats.getPromedioPeso() != null && stats.getPromedioPeso() > 0) {
                sumaPesos += stats.getPromedioPeso() * stats.getTotalMascotas();
                countPesos += stats.getTotalMascotas().intValue();
            }
        }
        
        estadisticasGlobales.setTotalPorEspecie(totalPorEspecieGlobal);
        estadisticasGlobales.setTotalPorSexo(totalPorSexoGlobal);
        estadisticasGlobales.setPromedioEdad(countEdades > 0 ? sumaEdades / countEdades : null);
        estadisticasGlobales.setPromedioPeso(countPesos > 0 ? sumaPesos / countPesos : null);
        return ResponseEntity.ok(estadisticasGlobales);
    }

    @GetMapping("/mascotas/especie/{especie}")
    public ResponseEntity<List<ReporteMascotaDTO>> getReporteMascotasPorEspecie(
            @PathVariable String especie,
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si no se especificó veterinaria, agregar datos de todas las veterinarias
        List<ReporteMascotaDTO> reporte = new ArrayList<>();
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteMascotasPorEspecieYVeterinaria(especie, veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                reporte.addAll(gestionReporteService.getReporteMascotasPorEspecieYVeterinaria(especie, vetId));
            }
        }
        
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE REPORTES DE CITAS ====================

    @GetMapping("/citas")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitas(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si no se especificó veterinaria, agregar datos de todas las veterinarias
        List<ReporteCitaDTO> reporte = new ArrayList<>();
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                reporte.addAll(gestionReporteService.getReporteCitasPorVeterinaria(vetId));
            }
        }
        
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/citas/estadisticas")
    public ResponseEntity<EstadisticasCitasDTO> getEstadisticasCitas(
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver estadísticas vacías
        if (veterinariasIds.isEmpty()) {
            EstadisticasCitasDTO empty = new EstadisticasCitasDTO();
            empty.setTotalCitas(0L);
            empty.setCitasHoy(0L);
            empty.setCitasSemana(0L);
            empty.setCitasMes(0L);
            return ResponseEntity.ok(empty);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            EstadisticasCitasDTO empty = new EstadisticasCitasDTO();
            empty.setTotalCitas(0L);
            empty.setCitasHoy(0L);
            empty.setCitasSemana(0L);
            empty.setCitasMes(0L);
            return ResponseEntity.ok(empty);
        }
        
        // Si no se especificó veterinaria, agregar estadísticas de todas las veterinarias
        EstadisticasCitasDTO estadisticasAgregadas = new EstadisticasCitasDTO();
        estadisticasAgregadas.setTotalCitas(0L);
        estadisticasAgregadas.setCitasHoy(0L);
        estadisticasAgregadas.setCitasSemana(0L);
        estadisticasAgregadas.setCitasMes(0L);
        
        if (veterinariaId != null) {
            estadisticasAgregadas = gestionReporteService.getEstadisticasCitasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                EstadisticasCitasDTO stats = gestionReporteService.getEstadisticasCitasPorVeterinaria(vetId);
                estadisticasAgregadas.setTotalCitas(estadisticasAgregadas.getTotalCitas() + stats.getTotalCitas());
                estadisticasAgregadas.setCitasHoy(estadisticasAgregadas.getCitasHoy() + stats.getCitasHoy());
                estadisticasAgregadas.setCitasSemana(estadisticasAgregadas.getCitasSemana() + stats.getCitasSemana());
                estadisticasAgregadas.setCitasMes(estadisticasAgregadas.getCitasMes() + stats.getCitasMes());
            }
        }
        
        return ResponseEntity.ok(estadisticasAgregadas);
    }

    @GetMapping("/citas/estado/{estado}")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitasPorEstado(
            @PathVariable String estado,
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si no se especificó veterinaria, agregar datos de todas las veterinarias
        List<ReporteCitaDTO> reporte = new ArrayList<>();
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteCitasPorEstadoYVeterinaria(estado, veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                reporte.addAll(gestionReporteService.getReporteCitasPorEstadoYVeterinaria(estado, vetId));
            }
        }
        
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/citas/fecha")
    public ResponseEntity<List<ReporteCitaDTO>> getReporteCitasPorFecha(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin,
            @RequestParam(required = false) Long veterinariaId) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            return ResponseEntity.ok(List.of());
        }
        
        // Convertir las fechas String a LocalDateTime (inicio del día y fin del día)
        LocalDateTime inicio = LocalDate.parse(fechaInicio).atStartOfDay();
        LocalDateTime fin = LocalDate.parse(fechaFin).atTime(23, 59, 59);
        
        // Si no se especificó veterinaria, agregar datos de todas las veterinarias
        List<ReporteCitaDTO> reporte = new ArrayList<>();
        if (veterinariaId != null) {
            reporte = gestionReporteService.getReporteCitasPorFechaYVeterinaria(inicio, fin, veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                reporte.addAll(gestionReporteService.getReporteCitasPorFechaYVeterinaria(inicio, fin, vetId));
            }
        }
        
        return ResponseEntity.ok(reporte);
    }

    // ==================== ENDPOINTS DE EXPORTACIÓN CSV ====================
    
    @GetMapping("/usuarios/export/csv")
    public ResponseEntity<byte[]> exportarReporteUsuariosCSV(
            @RequestParam(required = false) Long veterinariaId,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String search) {
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            byte[] csvBytes = csvExportService.exportarUsuariosCSV(List.of());
            String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            byte[] csvBytes = csvExportService.exportarUsuariosCSV(List.of());
            String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Obtener usuarios de todas las veterinarias o de una específica
        List<ReporteUsuarioDTO> usuarios = new ArrayList<>();
        if (veterinariaId != null) {
            usuarios = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                usuarios.addAll(gestionReporteService.getReporteUsuariosPorVeterinaria(vetId));
            }
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
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            byte[] csvBytes = csvExportService.exportarMascotasCSV(List.of());
            String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            byte[] csvBytes = csvExportService.exportarMascotasCSV(List.of());
            String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Obtener mascotas de todas las veterinarias o de una específica
        List<ReporteMascotaDTO> mascotas = new ArrayList<>();
        if (veterinariaId != null) {
            mascotas = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                mascotas.addAll(gestionReporteService.getReporteMascotasPorVeterinaria(vetId));
            }
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
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver lista vacía
        if (veterinariasIds.isEmpty()) {
            byte[] csvBytes = csvExportService.exportarCitasCSV(List.of());
            String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            byte[] csvBytes = csvExportService.exportarCitasCSV(List.of());
            String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }
        
        // Obtener citas de todas las veterinarias o de una específica
        List<ReporteCitaDTO> citas = new ArrayList<>();
        if (veterinariaId != null) {
            citas = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                citas.addAll(gestionReporteService.getReporteCitasPorVeterinaria(vetId));
            }
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
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver reporte vacío
        if (veterinariasIds.isEmpty()) {
            EstadisticasUsuariosDTO emptyStats = new EstadisticasUsuariosDTO();
            emptyStats.setTotalUsuarios(0L);
            emptyStats.setTotalActivos(0L);
            emptyStats.setTotalInactivos(0L);
            byte[] pdfBytes = pdfExportService.generarReporteUsuariosPDF(List.of(), emptyStats);
            String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            EstadisticasUsuariosDTO emptyStats = new EstadisticasUsuariosDTO();
            emptyStats.setTotalUsuarios(0L);
            emptyStats.setTotalActivos(0L);
            emptyStats.setTotalInactivos(0L);
            byte[] pdfBytes = pdfExportService.generarReporteUsuariosPDF(List.of(), emptyStats);
            String filename = "reporte_usuarios_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Obtener usuarios y estadísticas
        List<ReporteUsuarioDTO> usuarios = new ArrayList<>();
        EstadisticasUsuariosDTO estadisticasAgregadas = new EstadisticasUsuariosDTO();
        estadisticasAgregadas.setTotalUsuarios(0L);
        estadisticasAgregadas.setTotalActivos(0L);
        estadisticasAgregadas.setTotalInactivos(0L);
        estadisticasAgregadas.setTotalPorRol(new HashMap<>());
        
        if (veterinariaId != null) {
            usuarios = gestionReporteService.getReporteUsuariosPorVeterinaria(veterinariaId);
            estadisticasAgregadas = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                usuarios.addAll(gestionReporteService.getReporteUsuariosPorVeterinaria(vetId));
                EstadisticasUsuariosDTO stats = gestionReporteService.getEstadisticasUsuariosPorVeterinaria(vetId);
                estadisticasAgregadas.setTotalUsuarios(estadisticasAgregadas.getTotalUsuarios() + stats.getTotalUsuarios());
                estadisticasAgregadas.setTotalActivos(estadisticasAgregadas.getTotalActivos() + stats.getTotalActivos());
                estadisticasAgregadas.setTotalInactivos(estadisticasAgregadas.getTotalInactivos() + stats.getTotalInactivos());
                
                // Combinar mapas de totalPorRol
                if (stats.getTotalPorRol() != null) {
                    java.util.Map<String, Long> totalPorRolMap = estadisticasAgregadas.getTotalPorRol();
                    stats.getTotalPorRol().forEach((rolKey, count) -> 
                        totalPorRolMap.merge(rolKey, count, Long::sum)
                    );
                }
            }
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
        
        byte[] pdfBytes = pdfExportService.generarReporteUsuariosPDF(usuarios, estadisticasAgregadas);
        
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
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver reporte vacío
        if (veterinariasIds.isEmpty()) {
            EstadisticasMascotasDTO emptyStats = new EstadisticasMascotasDTO();
            emptyStats.setTotalMascotas(0L);
            byte[] pdfBytes = pdfExportService.generarReporteMascotasPDF(List.of(), emptyStats);
            String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            EstadisticasMascotasDTO emptyStats = new EstadisticasMascotasDTO();
            emptyStats.setTotalMascotas(0L);
            byte[] pdfBytes = pdfExportService.generarReporteMascotasPDF(List.of(), emptyStats);
            String filename = "reporte_mascotas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Obtener mascotas y estadísticas
        List<ReporteMascotaDTO> mascotas = new ArrayList<>();
        EstadisticasMascotasDTO estadisticasAgregadas = new EstadisticasMascotasDTO();
        estadisticasAgregadas.setTotalMascotas(0L);
        estadisticasAgregadas.setTotalPorEspecie(new HashMap<>());
        estadisticasAgregadas.setTotalPorSexo(new HashMap<>());
        
        if (veterinariaId != null) {
            mascotas = gestionReporteService.getReporteMascotasPorVeterinaria(veterinariaId);
            estadisticasAgregadas = gestionReporteService.getEstadisticasMascotasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                mascotas.addAll(gestionReporteService.getReporteMascotasPorVeterinaria(vetId));
                EstadisticasMascotasDTO stats = gestionReporteService.getEstadisticasMascotasPorVeterinaria(vetId);
                estadisticasAgregadas.setTotalMascotas(estadisticasAgregadas.getTotalMascotas() + stats.getTotalMascotas());
                
                // Combinar mapas de totalPorEspecie
                if (stats.getTotalPorEspecie() != null) {
                    java.util.Map<String, Long> totalPorEspecieMap = estadisticasAgregadas.getTotalPorEspecie();
                    stats.getTotalPorEspecie().forEach((esp, count) -> 
                        totalPorEspecieMap.merge(esp, count, Long::sum)
                    );
                }
                
                // Combinar mapas de totalPorSexo
                if (stats.getTotalPorSexo() != null) {
                    java.util.Map<String, Long> totalPorSexoMap = estadisticasAgregadas.getTotalPorSexo();
                    stats.getTotalPorSexo().forEach((sexo, count) -> 
                        totalPorSexoMap.merge(sexo, count, Long::sum)
                    );
                }
            }
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
        
        byte[] pdfBytes = pdfExportService.generarReporteMascotasPDF(mascotas, estadisticasAgregadas);
        
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
        // Obtener todas las veterinarias del admin autenticado
        List<Long> veterinariasIds = getAllVeterinariasIdsFromAuthenticatedUser();
        
        // Si el admin no tiene veterinarias asociadas, devolver reporte vacío
        if (veterinariasIds.isEmpty()) {
            EstadisticasCitasDTO emptyStats = new EstadisticasCitasDTO();
            emptyStats.setTotalCitas(0L);
            emptyStats.setCitasHoy(0L);
            emptyStats.setCitasSemana(0L);
            emptyStats.setCitasMes(0L);
            byte[] pdfBytes = pdfExportService.generarReporteCitasPDF(List.of(), emptyStats);
            String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Si se especificó una veterinaria, validar que pertenezca al admin
        if (veterinariaId != null && !veterinariasIds.contains(veterinariaId)) {
            EstadisticasCitasDTO emptyStats = new EstadisticasCitasDTO();
            emptyStats.setTotalCitas(0L);
            emptyStats.setCitasHoy(0L);
            emptyStats.setCitasSemana(0L);
            emptyStats.setCitasMes(0L);
            byte[] pdfBytes = pdfExportService.generarReporteCitasPDF(List.of(), emptyStats);
            String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("application/pdf"))
                    .body(pdfBytes);
        }
        
        // Obtener citas y estadísticas
        List<ReporteCitaDTO> citas = new ArrayList<>();
        EstadisticasCitasDTO estadisticasAgregadas = new EstadisticasCitasDTO();
        estadisticasAgregadas.setTotalCitas(0L);
        estadisticasAgregadas.setCitasHoy(0L);
        estadisticasAgregadas.setCitasSemana(0L);
        estadisticasAgregadas.setCitasMes(0L);
        
        if (veterinariaId != null) {
            citas = gestionReporteService.getReporteCitasPorVeterinaria(veterinariaId);
            estadisticasAgregadas = gestionReporteService.getEstadisticasCitasPorVeterinaria(veterinariaId);
        } else {
            for (Long vetId : veterinariasIds) {
                citas.addAll(gestionReporteService.getReporteCitasPorVeterinaria(vetId));
                EstadisticasCitasDTO stats = gestionReporteService.getEstadisticasCitasPorVeterinaria(vetId);
                estadisticasAgregadas.setTotalCitas(estadisticasAgregadas.getTotalCitas() + stats.getTotalCitas());
                estadisticasAgregadas.setCitasHoy(estadisticasAgregadas.getCitasHoy() + stats.getCitasHoy());
                estadisticasAgregadas.setCitasSemana(estadisticasAgregadas.getCitasSemana() + stats.getCitasSemana());
                estadisticasAgregadas.setCitasMes(estadisticasAgregadas.getCitasMes() + stats.getCitasMes());
            }
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
        
        byte[] pdfBytes = pdfExportService.generarReporteCitasPDF(citas, estadisticasAgregadas);
        
        String filename = "reporte_citas_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("application/pdf"))
                .body(pdfBytes);
    }
}
