package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Veterinaria;
import com.veterinaria.veterinaria.repository.VeterinariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VeterinariaService {
    
    @Autowired
    private VeterinariaRepository veterinariaRepository;
    
    public List<Veterinaria> findAll() {
        return veterinariaRepository.findAll();
    }
    
    public Page<Veterinaria> findAll(Pageable pageable) {
        return veterinariaRepository.findAll(pageable);
    }
    
    public Optional<Veterinaria> findById(Long id) {
        return veterinariaRepository.findById(id);
    }
    
    public List<Veterinaria> findByActivoTrue() {
        return veterinariaRepository.findByActivoTrue();
    }
    
    public List<Veterinaria> findByCiudad(String ciudad) {
        return veterinariaRepository.findByCiudadIgnoreCase(ciudad);
    }
    
    public List<Veterinaria> findByNombreContaining(String nombre) {
        return veterinariaRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    public Veterinaria save(Veterinaria veterinaria) {
        return veterinariaRepository.save(veterinaria);
    }
    
    public void deleteById(Long id) {
        veterinariaRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return veterinariaRepository.existsById(id);
    }
    
    public long count() {
        return veterinariaRepository.count();
    }
    
    public long countByActivoTrue() {
        return veterinariaRepository.findByActivoTrue().size();
    }
}