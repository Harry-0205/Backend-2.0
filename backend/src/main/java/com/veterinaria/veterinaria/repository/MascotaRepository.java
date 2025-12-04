package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByPropietarioDocumento(String propietarioDocumento);
    List<Mascota> findByActivoTrue();
    List<Mascota> findByPropietarioDocumentoAndActivoTrue(String propietarioDocumento);
    List<Mascota> findByEspecieContainingIgnoreCase(String especie);
    List<Mascota> findByNombreContainingIgnoreCase(String nombre);
    
    // Encontrar mascotas cuyos propietarios pertenecen a una veterinaria específica
    @Query("SELECT m FROM Mascota m WHERE m.propietario.veterinaria.id = :veterinariaId")
    List<Mascota> findByPropietarioVeterinariaId(@Param("veterinariaId") Long veterinariaId);
    
    // Métodos de conteo
    long countByActivoTrue();
    long countByPropietario(Usuario propietario);
    
    // Métodos de conteo filtrados por veterinaria
    @Query("SELECT COUNT(m) FROM Mascota m WHERE m.propietario.veterinaria.id = :veterinariaId")
    long countByPropietarioVeterinariaId(@Param("veterinariaId") Long veterinariaId);
    
    @Query("SELECT COUNT(m) FROM Mascota m WHERE m.activo = true AND m.propietario.veterinaria.id = :veterinariaId")
    long countByActivoTrueAndPropietarioVeterinariaId(@Param("veterinariaId") Long veterinariaId);
    
    // Métodos para reportes
    List<Mascota> findByEspecie(String especie);
}