package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.repository.MascotaRepository;
import com.veterinaria.veterinaria.repository.CitaRepository;
import com.veterinaria.veterinaria.repository.HistoriaClinicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class MascotaService {
    
    @Autowired
    private MascotaRepository mascotaRepository;
    
    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;
    
    public List<Mascota> findAll() {
        return mascotaRepository.findAll();
    }
    
    public Page<Mascota> findAll(Pageable pageable) {
        return mascotaRepository.findAll(pageable);
    }
    
    public Optional<Mascota> findById(Long id) {
        return mascotaRepository.findById(id);
    }
    
    public List<Mascota> findByPropietarioDocumento(String propietarioDocumento) {
        return mascotaRepository.findByPropietarioDocumento(propietarioDocumento);
    }
    
    public List<Mascota> findActiveMascotas() {
        return mascotaRepository.findByActivoTrue();
    }
    
    public List<Mascota> findActiveMascotasByPropietario(String propietarioDocumento) {
        return mascotaRepository.findByPropietarioDocumentoAndActivoTrue(propietarioDocumento);
    }
    
    public List<Mascota> findByEspecie(String especie) {
        return mascotaRepository.findByEspecieContainingIgnoreCase(especie);
    }
    
    public List<Mascota> findByNombre(String nombre) {
        return mascotaRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    public Mascota save(Mascota mascota) {
        return mascotaRepository.save(mascota);
    }
    
    public Mascota update(Mascota mascota) {
        return mascotaRepository.save(mascota);
    }
    
    public void deleteById(Long id) {
        mascotaRepository.deleteById(id);
    }
    
    public void deactivate(Long id) {
        Optional<Mascota> mascota = mascotaRepository.findById(id);
        if (mascota.isPresent()) {
            mascota.get().setActivo(false);
            mascotaRepository.save(mascota.get());
        }
    }
    
    public void activate(Long id) {
        Optional<Mascota> mascota = mascotaRepository.findById(id);
        if (mascota.isPresent()) {
            mascota.get().setActivo(true);
            mascotaRepository.save(mascota.get());
        }
    }
    
    public long count() {
        return mascotaRepository.count();
    }
    
    public long countByActivoTrue() {
        return mascotaRepository.countByActivoTrue();
    }
    
    /**
     * Obtiene las mascotas que ha atendido un veterinario específico.
     * Combina las mascotas de citas e historias clínicas del veterinario.
     */
    public List<Mascota> findMascotasAtendidasByVeterinario(String veterinarioDocumento) {
        // Obtener mascotas únicas de las citas del veterinario
        List<Long> mascotaIdsFromCitas = citaRepository.findByVeterinarioDocumento(veterinarioDocumento)
            .stream()
            .map(cita -> cita.getMascota().getId())
            .distinct()
            .collect(Collectors.toList());
        
        // Obtener mascotas únicas de las historias clínicas del veterinario
        List<Long> mascotaIdsFromHistorias = historiaClinicaRepository.findByVeterinarioDocumento(veterinarioDocumento)
            .stream()
            .map(historia -> historia.getMascota().getId())
            .distinct()
            .collect(Collectors.toList());
        
        // Combinar ambas listas sin duplicados
        List<Long> mascotaIds = Stream.concat(
            mascotaIdsFromCitas.stream(),
            mascotaIdsFromHistorias.stream()
        ).distinct().collect(Collectors.toList());
        
        // Obtener las mascotas por sus IDs
        if (mascotaIds.isEmpty()) {
            return List.of();
        }
        
        return mascotaRepository.findAllById(mascotaIds);
    }
}