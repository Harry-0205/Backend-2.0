package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    
    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c")
    List<Cita> findAllWithRelations();
    
    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.id = :id")
    java.util.Optional<Cita> findByIdWithRelations(@Param("id") Long id);
    
    List<Cita> findByClienteDocumento(String clienteDocumento);
    List<Cita> findByVeterinarioDocumento(String veterinarioDocumento);
    List<Cita> findByMascotaId(Long mascotaId);
    List<Cita> findByMascotaIdOrderByFechaHoraDesc(Long mascotaId);
    List<Cita> findByEstado(Cita.EstadoCita estado);
    List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    @EntityGraph(attributePaths = {"cliente", "mascota", "mascota.propietario", "veterinario", "veterinario.veterinaria", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.veterinaria.id = :veterinariaId")
    List<Cita> findByVeterinariaId(@Param("veterinariaId") Long veterinariaId);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.cliente.documento = :clienteDocumento")
    List<Cita> findByClienteDocumentoWithRelations(@Param("clienteDocumento") String clienteDocumento);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.veterinario.documento = :veterinarioDocumento")
    List<Cita> findByVeterinarioDocumentoWithRelations(@Param("veterinarioDocumento") String veterinarioDocumento);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.mascota.id = :mascotaId")
    List<Cita> findByMascotaIdWithRelations(@Param("mascotaId") Long mascotaId);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.estado = :estado")
    List<Cita> findByEstadoWithRelations(@Param("estado") Cita.EstadoCita estado);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :inicio AND :fin")
    List<Cita> findByFechaHoraBetweenWithRelations(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    
    // Métodos de conteo
    long countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    long countByFechaHoraBetweenAndEstado(LocalDateTime inicio, LocalDateTime fin, Cita.EstadoCita estado);
    long countByEstado(Cita.EstadoCita estado);
    long countByCliente(Usuario cliente);
    long countByMascota(Mascota mascota);
    
    // Métodos para reportes
    Optional<Cita> findFirstByMascotaOrderByFechaHoraDesc(Mascota mascota);
    
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :inicio AND :fin AND c.veterinario.documento = :veterinarioDocumento")
    List<Cita> findByFechaHoraBetweenAndVeterinarioDocumento(@Param("inicio") LocalDateTime inicio, 
                                                              @Param("fin") LocalDateTime fin, 
                                                              @Param("veterinarioDocumento") String veterinarioDocumento);

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :inicio AND :fin AND c.veterinario.documento = :veterinarioDocumento")
    List<Cita> findByFechaHoraBetweenAndVeterinarioDocumentoWithRelations(@Param("inicio") LocalDateTime inicio, 
                                                                          @Param("fin") LocalDateTime fin, 
                                                                          @Param("veterinarioDocumento") String veterinarioDocumento);
    
    @Query("SELECT c FROM Cita c WHERE DATE(c.fechaHora) = CURRENT_DATE")
    List<Cita> findCitasDeHoy();

    @EntityGraph(attributePaths = {"cliente", "mascota", "veterinario", "veterinaria"})
    @Query("SELECT c FROM Cita c WHERE DATE(c.fechaHora) = CURRENT_DATE")
    List<Cita> findCitasDeHoyWithRelations();
    
    // Verificar disponibilidad de horario
    @Query("SELECT COUNT(c) > 0 FROM Cita c WHERE c.fechaHora = :fechaHora AND c.veterinaria.id = :veterinariaId AND c.estado NOT IN ('CANCELADA', 'NO_ASISTIO')")
    boolean existsCitaEnHorario(@Param("fechaHora") LocalDateTime fechaHora, @Param("veterinariaId") Long veterinariaId);
    
    @Query("SELECT COUNT(c) > 0 FROM Cita c WHERE c.fechaHora = :fechaHora AND c.veterinario.documento = :veterinarioDocumento AND c.estado NOT IN ('CANCELADA', 'NO_ASISTIO')")
    boolean existsCitaEnHorarioParaVeterinario(@Param("fechaHora") LocalDateTime fechaHora, @Param("veterinarioDocumento") String veterinarioDocumento);
    
    @Query("SELECT c FROM Cita c WHERE DATE(c.fechaHora) = DATE(:fecha) AND c.veterinaria.id = :veterinariaId AND c.estado NOT IN ('CANCELADA', 'NO_ASISTIO')")
    List<Cita> findCitasDelDia(@Param("fecha") LocalDateTime fecha, @Param("veterinariaId") Long veterinariaId);
}