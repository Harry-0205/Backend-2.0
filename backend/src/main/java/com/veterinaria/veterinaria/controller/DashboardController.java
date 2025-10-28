package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.DashboardStatsResponse;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private CitaService citaService;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        try {
            // Obtener estadísticas de usuarios
            long totalUsuarios = usuarioService.count();
            long usuariosActivos = usuarioService.countByActivoTrue();
            
            // Obtener estadísticas de mascotas
            long totalMascotas = mascotaService.count();
            long mascotasActivas = mascotaService.countByActivoTrue();
            
            // Obtener estadísticas de citas
            long totalCitas = citaService.count();
            long citasHoy = citaService.countCitasHoy();
            long citasPendientes = citaService.countByEstado(Cita.EstadoCita.PROGRAMADA);
            long citasConfirmadas = citaService.countByEstado(Cita.EstadoCita.CONFIRMADA);
            
            // Obtener estadísticas de veterinarias
            long totalVeterinarias = veterinariaService.count();
            long veterinariasActivas = veterinariaService.countByActivoTrue();
            
            DashboardStatsResponse stats = new DashboardStatsResponse(
                totalUsuarios, usuariosActivos, totalMascotas, mascotasActivas,
                totalCitas, citasHoy, citasPendientes, citasConfirmadas,
                totalVeterinarias, veterinariasActivas
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}