package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.Usuario;
import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private MascotaService mascotaService;
    
    @Autowired
    private CitaService citaService;
    
    @Autowired
    private VeterinariaService veterinariaService;
    
    @GetMapping("/global")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<Map<String, Object>> searchGlobal(@RequestParam String query) {
        Map<String, Object> results = new HashMap<>();
        
        try {
            // Buscar usuarios por nombre o documento
            List<Usuario> usuarios = usuarioService.searchByNameOrDocument(query);
            results.put("usuarios", usuarios);
            
            // Buscar mascotas por nombre o especie
            List<Mascota> mascotas = mascotaService.findByNombre(query);
            mascotas.addAll(mascotaService.findByEspecie(query));
            results.put("mascotas", mascotas);
            
            // Buscar veterinarias por nombre
            List<Veterinaria> veterinarias = veterinariaService.findByNombreContaining(query);
            results.put("veterinarias", veterinarias);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/mascotas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<Mascota>> searchMascotas(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) String propietarioDocumento,
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        
        try {
            List<Mascota> mascotas;
            
            if (propietarioDocumento != null) {
                if (activo) {
                    mascotas = mascotaService.findActiveMascotasByPropietario(propietarioDocumento);
                } else {
                    mascotas = mascotaService.findByPropietarioDocumento(propietarioDocumento);
                }
            } else if (nombre != null) {
                mascotas = mascotaService.findByNombre(nombre);
            } else if (especie != null) {
                mascotas = mascotaService.findByEspecie(especie);
            } else {
                mascotas = activo ? mascotaService.findActiveMascotas() : mascotaService.findAll();
            }
            
            return ResponseEntity.ok(mascotas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/citas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA') or hasRole('VETERINARIO')")
    public ResponseEntity<List<Cita>> searchCitas(
            @RequestParam(required = false) String clienteDocumento,
            @RequestParam(required = false) String veterinarioDocumento,
            @RequestParam(required = false) Long mascotaId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        try {
            List<Cita> citas;
            
            if (clienteDocumento != null) {
                citas = citaService.findByClienteDocumento(clienteDocumento);
            } else if (veterinarioDocumento != null) {
                citas = citaService.findByVeterinarioDocumento(veterinarioDocumento);
            } else if (mascotaId != null) {
                citas = citaService.findByMascotaId(mascotaId);
            } else if (estado != null) {
                citas = citaService.findByEstado(Cita.EstadoCita.valueOf(estado.toUpperCase()));
            } else if (fechaInicio != null && fechaFin != null) {
                citas = citaService.findByFechaHoraBetween(fechaInicio, fechaFin);
            } else {
                citas = citaService.findAll();
            }
            
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> searchUsuarios(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        
        try {
            List<Usuario> usuarios;
            
            if (query != null) {
                usuarios = usuarioService.searchByNameOrDocument(query);
            } else if (rol != null) {
                usuarios = usuarioService.findByRol(rol);
            } else {
                usuarios = activo ? usuarioService.findByActivoTrue() : usuarioService.findAll();
            }
            
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}