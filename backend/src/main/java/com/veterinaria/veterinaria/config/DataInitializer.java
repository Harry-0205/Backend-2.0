package com.veterinaria.veterinaria.config;

import com.veterinaria.veterinaria.entity.Rol;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.repository.RolRepository;
import com.veterinaria.veterinaria.repository.UsuarioRepository;
import com.veterinaria.veterinaria.repository.VeterinariaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private VeterinariaRepository veterinariaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeAdminUser();
        initializeVeterinaria();
    }
    
    private void initializeRoles() {
        if (rolRepository.count() == 0) {
            logger.info("Inicializando roles...");
            
            Rol adminRole = new Rol("ADMIN", "Administrador del sistema con acceso completo");
            Rol veterinarioRole = new Rol("VETERINARIO", "Veterinario con acceso a consultas y diagnósticos");
            Rol recepcionistaRole = new Rol("RECEPCIONISTA", "Recepcionista con acceso a gestión de citas y clientes");
            Rol clienteRole = new Rol("CLIENTE", "Cliente con acceso limitado a sus mascotas y citas");
            
            rolRepository.save(adminRole);
            rolRepository.save(veterinarioRole);
            rolRepository.save(recepcionistaRole);
            rolRepository.save(clienteRole);
            
            logger.info("Roles inicializados correctamente");
        }
    }
    
    private void initializeAdminUser() {
        if (usuarioRepository.count() == 0) {
            logger.info("Inicializando usuario administrador...");
            
            Usuario admin = new Usuario();
            admin.setDocumento("12345678"); // Asignar documento como ID
            admin.setTipoDocumento("CC");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombres("Administrador");
            admin.setApellidos("Sistema");
            admin.setEmail("admin@veterinaria.com");
            admin.setTelefono("3001234567");
            admin.setDireccion("Oficina Principal");
            admin.setActivo(true);
            
            Set<Rol> roles = new HashSet<>();
            Rol adminRole = rolRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));
            roles.add(adminRole);
            admin.setRoles(roles);
            
            usuarioRepository.save(admin);
            
            logger.info("Usuario administrador inicializado: username=admin, password=admin123");
        }
    }
    
    private void initializeVeterinaria() {
        if (veterinariaRepository.count() == 0) {
            logger.info("Inicializando veterinaria...");
            
            Veterinaria veterinaria = new Veterinaria();
            veterinaria.setNombre("Veterinaria Pet Care");
            veterinaria.setDireccion("Calle Principal 123, Ciudad");
            veterinaria.setTelefono("+57 1 234-5678");
            veterinaria.setEmail("info@petcare.com");
            veterinaria.setDescripcion("Clínica veterinaria especializada en cuidado integral de mascotas");
            veterinaria.setHorarioAtencion("Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 8:00 AM - 2:00 PM");
            veterinaria.setActivo(true);
            
            veterinariaRepository.save(veterinaria);
            
            logger.info("Veterinaria inicializada correctamente");
        }
    }
}