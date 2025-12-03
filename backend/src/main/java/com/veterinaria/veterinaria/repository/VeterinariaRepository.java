package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Veterinaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeterinariaRepository extends JpaRepository<Veterinaria, Long> {
    List<Veterinaria> findByActivoTrue();
    List<Veterinaria> findByNombreContainingIgnoreCase(String nombre);
    List<Veterinaria> findByCiudadIgnoreCase(String ciudad);
    List<Veterinaria> findByActivoTrueAndCiudadIgnoreCase(String ciudad);
    List<Veterinaria> findByCreadoPorDocumento(String creadoPorDocumento);
}