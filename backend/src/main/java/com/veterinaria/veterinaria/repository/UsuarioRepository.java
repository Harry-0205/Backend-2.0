package com.veterinaria.veterinaria.repository;

import com.veterinaria.veterinaria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    List<Usuario> findByVeterinaria_Id(Long veterinariaId);
    List<Usuario> findByVeterinaria_IdAndRoles_Nombre(Long veterinariaId, String rolNombre);
    List<Usuario> findByRoles_NombreAndActivoTrue(String rolNombre);
    
    // Método para encontrar clientes atendidos por un veterinario específico
    @Query("SELECT DISTINCT c FROM Usuario c " +
           "JOIN c.roles r " +
           "WHERE r.nombre = 'ROLE_CLIENTE' " +
           "AND EXISTS (SELECT 1 FROM Cita ci WHERE ci.cliente = c AND ci.veterinario.documento = :veterinarioDocumento)")
    List<Usuario> findClientesAtendidosPorVeterinario(@Param("veterinarioDocumento") String veterinarioDocumento);
    
    // Métodos de conteo
    long countByActivoTrue();
}