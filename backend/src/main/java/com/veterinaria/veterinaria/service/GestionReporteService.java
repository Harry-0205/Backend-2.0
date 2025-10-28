package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.dto.*;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.repository.CitaRepository;
import com.veterinaria.veterinaria.repository.HistoriaClinicaRepository;
import com.veterinaria.veterinaria.repository.MascotaRepository;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GestionReporteService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MascotaRepository mascotaRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;

    // ==================== REPORTES DE USUARIOS ====================

    public List<ReporteUsuarioDTO> getReporteUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream()
                .map(usuario -> {
                    Long totalMascotas = mascotaRepository.countByPropietario(usuario);
                    Long totalCitas = citaRepository.countByCliente(usuario);
                    return new ReporteUsuarioDTO(usuario, totalMascotas, totalCitas);
                })
                .collect(Collectors.toList());
    }

    public List<ReporteUsuarioDTO> getReporteUsuariosPorRol(String rol) {
        List<Usuario> usuarios = usuarioRepository.findByRoles_Nombre(rol);
        return usuarios.stream()
                .map(usuario -> {
                    Long totalMascotas = mascotaRepository.countByPropietario(usuario);
                    Long totalCitas = citaRepository.countByCliente(usuario);
                    return new ReporteUsuarioDTO(usuario, totalMascotas, totalCitas);
                })
                .collect(Collectors.toList());
    }

    public EstadisticasUsuariosDTO getEstadisticasUsuarios() {
        Long totalUsuarios = usuarioRepository.count();
        Long totalActivos = usuarioRepository.countByActivoTrue();
        Long totalInactivos = totalUsuarios - totalActivos;

        EstadisticasUsuariosDTO estadisticas = new EstadisticasUsuariosDTO(
                totalUsuarios, 
                totalActivos, 
                totalInactivos
        );

        // Contar usuarios por rol
        Map<String, Long> totalPorRol = new HashMap<>();
        totalPorRol.put("ADMIN", (long) usuarioRepository.findByRoles_Nombre("ADMIN").size());
        totalPorRol.put("VETERINARIO", (long) usuarioRepository.findByRoles_Nombre("VETERINARIO").size());
        totalPorRol.put("RECEPCIONISTA", (long) usuarioRepository.findByRoles_Nombre("RECEPCIONISTA").size());
        totalPorRol.put("CLIENTE", (long) usuarioRepository.findByRoles_Nombre("CLIENTE").size());

        estadisticas.setTotalPorRol(totalPorRol);

        return estadisticas;
    }

    // ==================== REPORTES DE MASCOTAS ====================

    public List<ReporteMascotaDTO> getReporteMascotas() {
        List<Mascota> mascotas = mascotaRepository.findAll();
        return mascotas.stream()
                .map(mascota -> {
                    Long totalCitas = citaRepository.countByMascota(mascota);
                    Long totalHistorias = historiaClinicaRepository.countByMascota(mascota);
                    LocalDateTime ultimaCita = citaRepository.findFirstByMascotaOrderByFechaHoraDesc(mascota)
                            .map(Cita::getFechaHora)
                            .orElse(null);
                    return new ReporteMascotaDTO(mascota, totalCitas, totalHistorias, ultimaCita);
                })
                .collect(Collectors.toList());
    }

    public List<ReporteMascotaDTO> getReporteMascotasPorEspecie(String especie) {
        List<Mascota> mascotas = mascotaRepository.findByEspecie(especie);
        return mascotas.stream()
                .map(mascota -> {
                    Long totalCitas = citaRepository.countByMascota(mascota);
                    Long totalHistorias = historiaClinicaRepository.countByMascota(mascota);
                    LocalDateTime ultimaCita = citaRepository.findFirstByMascotaOrderByFechaHoraDesc(mascota)
                            .map(Cita::getFechaHora)
                            .orElse(null);
                    return new ReporteMascotaDTO(mascota, totalCitas, totalHistorias, ultimaCita);
                })
                .collect(Collectors.toList());
    }

    public EstadisticasMascotasDTO getEstadisticasMascotas() {
        Long totalMascotas = mascotaRepository.count();
        EstadisticasMascotasDTO estadisticas = new EstadisticasMascotasDTO(totalMascotas);

        // Contar por especie
        Map<String, Long> totalPorEspecie = new HashMap<>();
        List<Mascota> mascotas = mascotaRepository.findAll();
        
        mascotas.stream()
                .collect(Collectors.groupingBy(Mascota::getEspecie, Collectors.counting()))
                .forEach(totalPorEspecie::put);
        
        estadisticas.setTotalPorEspecie(totalPorEspecie);

        // Contar por sexo
        Map<String, Long> totalPorSexo = new HashMap<>();
        mascotas.stream()
                .filter(m -> m.getSexo() != null)
                .collect(Collectors.groupingBy(Mascota::getSexo, Collectors.counting()))
                .forEach(totalPorSexo::put);
        
        estadisticas.setTotalPorSexo(totalPorSexo);

        // Calcular promedio de edad
        Double promedioEdad = mascotas.stream()
                .filter(m -> m.getFechaNacimiento() != null)
                .mapToInt(m -> Period.between(m.getFechaNacimiento(), LocalDate.now()).getYears())
                .average()
                .orElse(0.0);
        estadisticas.setPromedioEdad(promedioEdad);

        // Calcular promedio de peso
        Double promedioPeso = mascotas.stream()
                .filter(m -> m.getPeso() != null)
                .mapToDouble(Mascota::getPeso)
                .average()
                .orElse(0.0);
        estadisticas.setPromedioPeso(promedioPeso);

        return estadisticas;
    }

    // ==================== REPORTES DE CITAS ====================

    public List<ReporteCitaDTO> getReporteCitas() {
        List<Cita> citas = citaRepository.findAll();
        return citas.stream()
                .map(ReporteCitaDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReporteCitaDTO> getReporteCitasPorEstado(String estado) {
        try {
            Cita.EstadoCita estadoCita = Cita.EstadoCita.valueOf(estado);
            List<Cita> citas = citaRepository.findByEstado(estadoCita);
            return citas.stream()
                    .map(ReporteCitaDTO::new)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<ReporteCitaDTO> getReporteCitasPorFecha(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<Cita> citas = citaRepository.findByFechaHoraBetween(fechaInicio, fechaFin);
        return citas.stream()
                .map(ReporteCitaDTO::new)
                .collect(Collectors.toList());
    }

    public EstadisticasCitasDTO getEstadisticasCitas() {
        Long totalCitas = citaRepository.count();
        EstadisticasCitasDTO estadisticas = new EstadisticasCitasDTO(totalCitas);

        // Contar por estado
        Map<String, Long> totalPorEstado = new HashMap<>();
        for (Cita.EstadoCita estado : Cita.EstadoCita.values()) {
            long count = citaRepository.countByEstado(estado);
            totalPorEstado.put(estado.name(), count);
        }
        estadisticas.setTotalPorEstado(totalPorEstado);

        // Citas de hoy
        LocalDateTime inicioHoy = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime finHoy = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        Long citasHoy = citaRepository.countByFechaHoraBetween(inicioHoy, finHoy);
        estadisticas.setCitasHoy(citasHoy);

        // Citas de esta semana
        LocalDateTime inicioSemana = LocalDateTime.of(LocalDate.now().minusDays(7), LocalTime.MIN);
        LocalDateTime finSemana = LocalDateTime.now();
        Long citasSemana = citaRepository.countByFechaHoraBetween(inicioSemana, finSemana);
        estadisticas.setCitasSemana(citasSemana);

        // Citas de este mes
        LocalDateTime inicioMes = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime finMes = LocalDateTime.now();
        Long citasMes = citaRepository.countByFechaHoraBetween(inicioMes, finMes);
        estadisticas.setCitasMes(citasMes);

        return estadisticas;
    }
}
