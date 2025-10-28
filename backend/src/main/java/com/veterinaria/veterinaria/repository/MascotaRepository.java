package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByPropietarioDocumento(String propietarioDocumento);
    List<Mascota> findByActivoTrue();
    List<Mascota> findByPropietarioDocumentoAndActivoTrue(String propietarioDocumento);
    List<Mascota> findByEspecieContainingIgnoreCase(String especie);
    List<Mascota> findByNombreContainingIgnoreCase(String nombre);
    
    // Métodos de conteo
    long countByActivoTrue();
    long countByPropietario(Usuario propietario);
    
    // Métodos para reportes
    List<Mascota> findByEspecie(String especie);
}