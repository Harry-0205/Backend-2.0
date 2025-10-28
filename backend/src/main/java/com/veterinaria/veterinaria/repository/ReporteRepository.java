package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    List<Reporte> findByGeneradoPorDocumento(String usuarioDocumento);
    List<Reporte> findByTipo(Reporte.TipoReporte tipo);
    List<Reporte> findByFechaGeneracionBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Reporte> findByOrderByFechaGeneracionDesc();
}