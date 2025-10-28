package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByDocumento(String documento);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByDocumento(String documento);
    List<Usuario> findByActivoTrue();
    List<Usuario> findByRoles_Nombre(String rolNombre);
    
    // Métodos de conteo
    long countByActivoTrue();
}