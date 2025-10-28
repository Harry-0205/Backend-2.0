package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.dto.VeterinariaResponse;
import com.veterinaria.veterinaria.service.VeterinariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/veterinarias")
public class VeterinariaController {
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping
    public ResponseEntity<List<VeterinariaResponse>> getAllVeterinarias() {
        List<Veterinaria> veterinarias = veterinariaService.findAll();
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pageable")
    public ResponseEntity<Page<Veterinaria>> getAllVeterinarias(Pageable pageable) {
        Page<Veterinaria> veterinarias = veterinariaService.findAll(pageable);
        return ResponseEntity.ok(veterinarias);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VeterinariaResponse> getVeterinariaById(@PathVariable Long id) {
        Optional<Veterinaria> veterinariaOpt = veterinariaService.findById(id);
        if (veterinariaOpt.isPresent()) {
            return ResponseEntity.ok(new VeterinariaResponse(veterinariaOpt.get()));
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/activas")
    public ResponseEntity<List<VeterinariaResponse>> getVeterinariasActivas() {
        List<Veterinaria> veterinarias = veterinariaService.findByActivoTrue();
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<List<VeterinariaResponse>> getVeterinariasByCiudad(@PathVariable String ciudad) {
        List<Veterinaria> veterinarias = veterinariaService.findByCiudad(ciudad);
        List<VeterinariaResponse> response = veterinarias.stream()
                .map(VeterinariaResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veterinaria> createVeterinaria(@Valid @RequestBody Veterinaria veterinaria) {
        try {
            System.out.println("=== Creando veterinaria: " + veterinaria.getNombre());
            Veterinaria nuevaVeterinaria = veterinariaService.save(veterinaria);
            return ResponseEntity.ok(nuevaVeterinaria);
        } catch (Exception e) {
            System.err.println("❌ Error al crear veterinaria: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veterinaria> updateVeterinaria(@PathVariable Long id, @Valid @RequestBody Veterinaria veterinariaDetails) {
        Optional<Veterinaria> optionalVeterinaria = veterinariaService.findById(id);
        
        if (optionalVeterinaria.isPresent()) {
            Veterinaria veterinaria = optionalVeterinaria.get();
            veterinaria.setNombre(veterinariaDetails.getNombre());
            veterinaria.setDireccion(veterinariaDetails.getDireccion());
            veterinaria.setTelefono(veterinariaDetails.getTelefono());
            veterinaria.setEmail(veterinariaDetails.getEmail());
            veterinaria.setCiudad(veterinariaDetails.getCiudad());
            veterinaria.setHorarioAtencion(veterinariaDetails.getHorarioAtencion());
            veterinaria.setServicios(veterinariaDetails.getServicios());
            
            Veterinaria veterinariaActualizada = veterinariaService.save(veterinaria);
            return ResponseEntity.ok(veterinariaActualizada);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veterinaria> activarVeterinaria(@PathVariable Long id) {
        Optional<Veterinaria> optionalVeterinaria = veterinariaService.findById(id);
        
        if (optionalVeterinaria.isPresent()) {
            Veterinaria veterinaria = optionalVeterinaria.get();
            veterinaria.setActivo(true);
            Veterinaria veterinariaActualizada = veterinariaService.save(veterinaria);
            return ResponseEntity.ok(veterinariaActualizada);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veterinaria> desactivarVeterinaria(@PathVariable Long id) {
        Optional<Veterinaria> optionalVeterinaria = veterinariaService.findById(id);
        
        if (optionalVeterinaria.isPresent()) {
            Veterinaria veterinaria = optionalVeterinaria.get();
            veterinaria.setActivo(false);
            Veterinaria veterinariaActualizada = veterinariaService.save(veterinaria);
            return ResponseEntity.ok(veterinariaActualizada);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVeterinaria(@PathVariable Long id) {
        Optional<Veterinaria> veterinaria = veterinariaService.findById(id);
        
        if (veterinaria.isPresent()) {
            veterinariaService.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}