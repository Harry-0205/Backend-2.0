package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.MascotaResponse;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.service.MascotaService;
import com.veterinaria.veterinaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getAllMascotas() {
        // Obtener el usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Verificar si el usuario tiene rol VETERINARIO
        boolean isVeterinario = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_VETERINARIO"));
        
        List<Mascota> mascotas;
        
        if (isVeterinario) {
            // Si es veterinario, obtener solo las mascotas que ha atendido
            Optional<Usuario> veterinario = usuarioService.findByUsername(username);
            if (veterinario.isPresent()) {
                mascotas = mascotaService.findMascotasAtendidasByVeterinario(veterinario.get().getDocumento());
            } else {
                mascotas = List.of();
            }
        } else {
            // Si es admin o recepcionista, obtener todas las mascotas
            mascotas = mascotaService.findAll();
        }
        
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pageable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<Page<Mascota>> getAllMascotas(Pageable pageable) {
        Page<Mascota> mascotas = mascotaService.findAll(pageable);
        return ResponseEntity.ok(mascotas);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @mascotaService.findById(#id).orElse(null)?.propietario?.username == authentication.name")
    public ResponseEntity<MascotaResponse> getMascotaById(@PathVariable Long id) {
        Optional<Mascota> mascota = mascotaService.findById(id);
        return mascota.map(m -> ResponseEntity.ok(new MascotaResponse(m)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/propietario/{propietarioDocumento}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @usuarioService.findById(#propietarioDocumento).orElse(null)?.username == authentication.name")
    public ResponseEntity<List<MascotaResponse>> getMascotasByPropietario(@PathVariable String propietarioDocumento) {
        List<Mascota> mascotas = mascotaService.findByPropietarioDocumento(propietarioDocumento);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/propietario/{propietarioDocumento}/activas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @usuarioService.findById(#propietarioDocumento).orElse(null)?.username == authentication.name")
    public ResponseEntity<List<MascotaResponse>> getMascotasActivasByPropietario(@PathVariable String propietarioDocumento) {
        List<Mascota> mascotas = mascotaService.findActiveMascotasByPropietario(propietarioDocumento);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/activas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getMascotasActivas() {
        List<Mascota> mascotas = mascotaService.findActiveMascotas();
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/buscar/especie/{especie}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<MascotaResponse>> getMascotasByEspecie(@PathVariable String especie) {
        List<Mascota> mascotas = mascotaService.findByEspecie(especie);
        List<MascotaResponse> response = mascotas.stream()
                .map(MascotaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/buscar/nombre/{nombre}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<Mascota>> getMascotasByNombre(@PathVariable String nombre) {
        List<Mascota> mascotas = mascotaService.findByNombre(nombre);
        return ResponseEntity.ok(mascotas);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('CLIENTE')")
    public ResponseEntity<Mascota> createMascota(@RequestBody Mascota mascota) {
        // Asegurar que el propietario existe antes de crear la mascota
        if (mascota.getPropietario() != null && mascota.getPropietario().getDocumento() != null) {
            Optional<Usuario> propietario = usuarioService.findById(mascota.getPropietario().getDocumento());
            if (propietario.isPresent()) {
                mascota.setPropietario(propietario.get());
                Mascota savedMascota = mascotaService.save(mascota);
                return ResponseEntity.ok(savedMascota);
            } else {
                return ResponseEntity.badRequest().build(); // Propietario no encontrado
            }
        }
        return ResponseEntity.badRequest().build(); // Datos de propietario inválidos
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO') or @mascotaService.findById(#id).orElse(null)?.propietario?.username == authentication.name")
    public ResponseEntity<Mascota> updateMascota(@PathVariable Long id, @RequestBody Mascota mascota) {
        Optional<Mascota> existingMascotaOpt = mascotaService.findById(id);
        if (existingMascotaOpt.isPresent()) {
            Mascota existingMascota = existingMascotaOpt.get();
            
            // Actualizar solo los campos editables, manteniendo el propietario original
            existingMascota.setNombre(mascota.getNombre());
            existingMascota.setEspecie(mascota.getEspecie());
            existingMascota.setRaza(mascota.getRaza());
            existingMascota.setSexo(mascota.getSexo());
            existingMascota.setFechaNacimiento(mascota.getFechaNacimiento());
            existingMascota.setPeso(mascota.getPeso());
            existingMascota.setColor(mascota.getColor());
            existingMascota.setObservaciones(mascota.getObservaciones());
            
            // No cambiar el propietario ni el ID
            // existingMascota.setPropietario() - NO TOCAR
            // existingMascota.setId() - NO TOCAR
            
            Mascota updatedMascota = mascotaService.update(existingMascota);
            return ResponseEntity.ok(updatedMascota);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMascota(@PathVariable Long id) {
        mascotaService.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<?> deactivateMascota(@PathVariable Long id) {
        mascotaService.deactivate(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateMascota(@PathVariable Long id) {
        mascotaService.activate(id);
        return ResponseEntity.ok().build();
    }
}