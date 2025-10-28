package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.dto.JwtResponse;
import com.veterinaria.veterinaria.dto.LoginRequest;
import com.veterinaria.veterinaria.dto.SignupRequest;
import com.veterinaria.veterinaria.entity.Rol;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.repository.RolRepository;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import com.veterinaria.veterinaria.security.JwtUtils;
import com.veterinaria.veterinaria.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UsuarioRepository usuarioRepository;
    
    @Autowired
    RolRepository rolRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(), 
                        loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        return new JwtResponse(jwt,
                userDetails.getDocumento(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }
    
    public ResponseEntity<?> registerUser(SignupRequest signUpRequest) {
        if (usuarioRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body("Error: ¡El nombre de usuario ya está en uso!");
        }
        
        if (usuarioRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Error: ¡El email ya está en uso!");
        }
        
        // Crear nueva cuenta de usuario
        Usuario usuario = new Usuario(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getNombres(),
                signUpRequest.getApellidos(),
                signUpRequest.getEmail());
        
        usuario.setTelefono(signUpRequest.getTelefono());
        usuario.setDireccion(signUpRequest.getDireccion());
        usuario.setDocumento(signUpRequest.getDocumento());
        
        Set<String> strRoles = signUpRequest.getRole();
        Set<Rol> roles = new HashSet<>();
        
        if (strRoles == null) {
            Rol userRole = rolRepository.findByNombre("CLIENTE")
                    .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Rol adminRole = rolRepository.findByNombre("ADMIN")
                                .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                        roles.add(adminRole);
                        break;
                    case "veterinario":
                        Rol vetRole = rolRepository.findByNombre("VETERINARIO")
                                .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                        roles.add(vetRole);
                        break;
                    case "recepcionista":
                        Rol recepRole = rolRepository.findByNombre("RECEPCIONISTA")
                                .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                        roles.add(recepRole);
                        break;
                    default:
                        Rol userRole = rolRepository.findByNombre("CLIENTE")
                                .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                        roles.add(userRole);
                }
            });
        }
        
        usuario.setRoles(roles);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok("¡Usuario registrado exitosamente!");
    }
}