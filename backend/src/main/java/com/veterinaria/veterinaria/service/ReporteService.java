package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Reporte;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.repository.ReporteRepository;
import com.veterinaria.veterinaria.repository.CitaRepository;
import com.veterinaria.veterinaria.repository.MascotaRepository;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReporteService {
    
    @Autowired
    private ReporteRepository reporteRepository;
    
    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private MascotaRepository mascotaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Reporte> findAll() {
        return reporteRepository.findAll();
    }
    
    public Page<Reporte> findAll(Pageable pageable) {
        return reporteRepository.findAll(pageable);
    }
    
    public Optional<Reporte> findById(Long id) {
        return reporteRepository.findById(id);
    }
    
    public List<Reporte> findByTipo(String tipo) {
        return reporteRepository.findByTipo(Reporte.TipoReporte.valueOf(tipo.toUpperCase()));
    }
    
    public List<Reporte> findByGeneradoPorDocumento(String usuarioDocumento) {
        return reporteRepository.findByGeneradoPorDocumento(usuarioDocumento);
    }
    
    public List<Reporte> findByFechaGeneracionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return reporteRepository.findByFechaGeneracionBetween(fechaInicio, fechaFin);
    }
    
    public Reporte save(Reporte reporte) {
        return reporteRepository.save(reporte);
    }
    
    public void deleteById(Long id) {
        reporteRepository.deleteById(id);
    }
    
    public Reporte generarReporteCitas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        // Obtener usuario actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Contar citas en el rango de fechas
        long totalCitas = citaRepository.countByFechaHoraBetween(fechaInicio, fechaFin);
        long citasConfirmadas = citaRepository.countByFechaHoraBetweenAndEstado(fechaInicio, fechaFin, Cita.EstadoCita.CONFIRMADA);
        long citasCanceladas = citaRepository.countByFechaHoraBetweenAndEstado(fechaInicio, fechaFin, Cita.EstadoCita.CANCELADA);
        long citasPendientes = citaRepository.countByFechaHoraBetweenAndEstado(fechaInicio, fechaFin, Cita.EstadoCita.PROGRAMADA);
        
        // Crear contenido del reporte
        StringBuilder contenido = new StringBuilder();
        contenido.append("=== REPORTE DE CITAS ===\n");
        contenido.append("Período: ").append(fechaInicio).append(" - ").append(fechaFin).append("\n\n");
        contenido.append("Total de citas: ").append(totalCitas).append("\n");
        contenido.append("Citas confirmadas: ").append(citasConfirmadas).append("\n");
        contenido.append("Citas canceladas: ").append(citasCanceladas).append("\n");
        contenido.append("Citas pendientes: ").append(citasPendientes).append("\n\n");
        
        // Crear y guardar el reporte
        Reporte reporte = new Reporte();
        reporte.setTitulo("Reporte de Citas - " + fechaInicio.toLocalDate() + " a " + fechaFin.toLocalDate());
        reporte.setTipo(Reporte.TipoReporte.CITAS_DIARIAS);
        reporte.setDescripcion("Reporte generado automáticamente con estadísticas de citas");
        reporte.setFechaInicio(fechaInicio.toLocalDate());
        reporte.setFechaFin(fechaFin.toLocalDate());
        reporte.setContenido(contenido.toString());
        reporte.setGeneradoPor(usuario);
        
        return reporteRepository.save(reporte);
    }
    
    public Reporte generarReporteMascotas() {
        // Obtener usuario actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Estadísticas de mascotas
        long totalMascotas = mascotaRepository.count();
        long mascotasActivas = mascotaRepository.countByActivoTrue();
        long mascotasInactivas = totalMascotas - mascotasActivas;
        
        // Crear contenido del reporte
        StringBuilder contenido = new StringBuilder();
        contenido.append("=== REPORTE DE MASCOTAS ===\n");
        contenido.append("Fecha de generación: ").append(LocalDateTime.now()).append("\n\n");
        contenido.append("Total de mascotas registradas: ").append(totalMascotas).append("\n");
        contenido.append("Mascotas activas: ").append(mascotasActivas).append("\n");
        contenido.append("Mascotas inactivas: ").append(mascotasInactivas).append("\n\n");
        
        // Crear y guardar el reporte
        Reporte reporte = new Reporte();
        reporte.setTitulo("Reporte de Mascotas Registradas - " + LocalDateTime.now().toLocalDate());
        reporte.setTipo(Reporte.TipoReporte.MASCOTAS_REGISTRADAS);
        reporte.setDescripcion("Reporte general de mascotas registradas en el sistema");
        reporte.setContenido(contenido.toString());
        reporte.setGeneradoPor(usuario);
        
        return reporteRepository.save(reporte);
    }
    
    public Reporte generarReporteUsuarios() {
        // Obtener usuario actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Estadísticas de usuarios
        long totalUsuarios = usuarioRepository.count();
        long usuariosActivos = usuarioRepository.countByActivoTrue();
        long usuariosInactivos = totalUsuarios - usuariosActivos;
        
        // Crear contenido del reporte
        StringBuilder contenido = new StringBuilder();
        contenido.append("=== REPORTE DE USUARIOS ===\n");
        contenido.append("Fecha de generación: ").append(LocalDateTime.now()).append("\n\n");
        contenido.append("Total de usuarios registrados: ").append(totalUsuarios).append("\n");
        contenido.append("Usuarios activos: ").append(usuariosActivos).append("\n");
        contenido.append("Usuarios inactivos: ").append(usuariosInactivos).append("\n\n");
        
        // Crear y guardar el reporte
        Reporte reporte = new Reporte();
        reporte.setTitulo("Reporte de Usuarios - " + LocalDateTime.now().toLocalDate());
        reporte.setTipo(Reporte.TipoReporte.USUARIOS_ACTIVOS);
        reporte.setDescripcion("Reporte general de usuarios registrados en el sistema");
        reporte.setContenido(contenido.toString());
        reporte.setGeneradoPor(usuario);
        
        return reporteRepository.save(reporte);
    }
}