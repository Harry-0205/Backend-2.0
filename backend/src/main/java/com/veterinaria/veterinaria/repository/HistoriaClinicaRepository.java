package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.HistoriaClinica;
import com.veterinaria.veterinaria.entity.Mascota;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    List<HistoriaClinica> findByMascotaId(Long mascotaId);
    List<HistoriaClinica> findByVeterinarioDocumento(String veterinarioDocumento);
    List<HistoriaClinica> findByFechaConsultaBetween(LocalDateTime inicio, LocalDateTime fin);
    List<HistoriaClinica> findByMascotaIdOrderByFechaConsultaDesc(Long mascotaId);
    
    // Encontrar historias clínicas de mascotas que pertenecen a una veterinaria
    @Query("SELECT h FROM HistoriaClinica h WHERE h.cita.veterinaria.id = :veterinariaId OR h.veterinario.veterinaria.id = :veterinariaId")
    List<HistoriaClinica> findByVeterinariaId(@Param("veterinariaId") Long veterinariaId);
    
    // Métodos de conteo
    long countByMascota(Mascota mascota);
    
    // Métodos con EntityGraph para cargar relaciones
    @EntityGraph(attributePaths = {"mascota", "mascota.propietario", "veterinario", "cita"})
    @Query("SELECT h FROM HistoriaClinica h")
    List<HistoriaClinica> findAllWithRelations();
    
    @EntityGraph(attributePaths = {"mascota", "mascota.propietario", "veterinario", "cita"})
    @Query("SELECT h FROM HistoriaClinica h WHERE h.id = :id")
    Optional<HistoriaClinica> findByIdWithRelations(@Param("id") Long id);
    
    @EntityGraph(attributePaths = {"mascota", "mascota.propietario", "veterinario", "cita"})
    @Query("SELECT h FROM HistoriaClinica h WHERE h.mascota.id = :mascotaId ORDER BY h.fechaConsulta DESC")
    List<HistoriaClinica> findByMascotaIdWithRelations(@Param("mascotaId") Long mascotaId);
    
    @EntityGraph(attributePaths = {"mascota", "mascota.propietario", "veterinario", "cita"})
    @Query("SELECT h FROM HistoriaClinica h WHERE h.veterinario.documento = :veterinarioDocumento")
    List<HistoriaClinica> findByVeterinarioDocumentoWithRelations(@Param("veterinarioDocumento") String veterinarioDocumento);
}