package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.repository.MascotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MascotaService {
    
    @Autowired
    private MascotaRepository mascotaRepository;
    
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
}