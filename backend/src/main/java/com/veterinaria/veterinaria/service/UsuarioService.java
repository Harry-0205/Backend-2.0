package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
    
    public Page<Usuario> findAll(Pageable pageable) {
        return usuarioRepository.findAll(pageable);
    }
    
    public Optional<Usuario> findById(String documento) {
        return usuarioRepository.findById(documento);
    }
    
    public Optional<Usuario> findByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }
    
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    public List<Usuario> findActiveUsers() {
        return usuarioRepository.findByActivoTrue();
    }
    
    public List<Usuario> findByRole(String rolNombre) {
        return usuarioRepository.findByRoles_Nombre(rolNombre);
    }
    
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    public Usuario update(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    public void deleteById(String documento) {
        usuarioRepository.deleteById(documento);
    }
    
    public void deactivate(String documento) {
        Optional<Usuario> usuario = usuarioRepository.findById(documento);
        if (usuario.isPresent()) {
            usuario.get().setActivo(false);
            usuarioRepository.save(usuario.get());
        }
    }
    
    public void activate(String documento) {
        Optional<Usuario> usuario = usuarioRepository.findById(documento);
        if (usuario.isPresent()) {
            usuario.get().setActivo(true);
            usuarioRepository.save(usuario.get());
        }
    }
    
    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
    
    public long count() {
        return usuarioRepository.count();
    }
    
    public long countByActivoTrue() {
        return usuarioRepository.countByActivoTrue();
    }
    
    public List<Usuario> findByActivoTrue() {
        return usuarioRepository.findByActivoTrue();
    }
    
    public List<Usuario> findByRol(String rolNombre) {
        return usuarioRepository.findByRoles_Nombre(rolNombre);
    }
    
    public List<Usuario> searchByNameOrDocument(String query) {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream()
                .filter(u -> (u.getNombres() != null && u.getNombres().toLowerCase().contains(query.toLowerCase())) ||
                           (u.getApellidos() != null && u.getApellidos().toLowerCase().contains(query.toLowerCase())) ||
                           (u.getDocumento() != null && u.getDocumento().contains(query)) ||
                           (u.getUsername() != null && u.getUsername().toLowerCase().contains(query.toLowerCase())))
                .toList();
    }
    
    public List<Usuario> findVeterinariosByVeterinariaId(Long veterinariaId) {
        return usuarioRepository.findByVeterinaria_IdAndRoles_Nombre(veterinariaId, "ROLE_VETERINARIO");
    }
    
    public List<Usuario> findVeterinariosActivos() {
        return usuarioRepository.findByRoles_NombreAndActivoTrue("ROLE_VETERINARIO");
    }
}