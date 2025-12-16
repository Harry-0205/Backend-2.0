package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import com.veterinaria.veterinaria.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("🔍 UserDetailsServiceImpl: Cargando usuario - " + username);
        
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        
        System.out.println("🔍 Usuario encontrado: " + username + " - activo=" + usuario.getActivo());
        
        // Verificar si el usuario está activo
        if (usuario.getActivo() == null || !usuario.getActivo()) {
            System.err.println("❌ UserDetailsServiceImpl: Usuario desactivado - " + username);
            throw new DisabledException("Usuario desactivado. No se permite el acceso a la plataforma.");
        }
        
        System.out.println("✅ UserDetailsServiceImpl: Usuario activo verificado - " + username);
        return UserPrincipal.create(usuario);
    }
}