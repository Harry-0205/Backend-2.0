package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.HistoriaClinica;
import com.veterinaria.veterinaria.repository.HistoriaClinicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HistoriaClinicaService {
    
    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;
    
    public List<HistoriaClinica> findAll() {
        return historiaClinicaRepository.findAllWithRelations();
    }
    
    public Page<HistoriaClinica> findAll(Pageable pageable) {
        return historiaClinicaRepository.findAll(pageable);
    }
    
    public Optional<HistoriaClinica> findById(Long id) {
        return historiaClinicaRepository.findByIdWithRelations(id);
    }
    
    public List<HistoriaClinica> findByMascotaId(Long mascotaId) {
        return historiaClinicaRepository.findByMascotaIdWithRelations(mascotaId);
    }
    
    public List<HistoriaClinica> findByVeterinarioDocumento(String veterinarioDocumento) {
        return historiaClinicaRepository.findByVeterinarioDocumentoWithRelations(veterinarioDocumento);
    }
    
    public List<HistoriaClinica> findByPropietarioDocumento(String propietarioDocumento) {
        return historiaClinicaRepository.findByPropietarioDocumento(propietarioDocumento);
    }
    
    public List<HistoriaClinica> findByFechaConsultaBetween(LocalDateTime inicio, LocalDateTime fin) {
        return historiaClinicaRepository.findByFechaConsultaBetween(inicio, fin);
    }
    
    public List<HistoriaClinica> findByMascotaOrderByFecha(Long mascotaId) {
        return historiaClinicaRepository.findByMascotaIdWithRelations(mascotaId);
    }
    
    public HistoriaClinica save(HistoriaClinica historiaClinica) {
        return historiaClinicaRepository.save(historiaClinica);
    }
    
    public HistoriaClinica update(HistoriaClinica historiaClinica) {
        return historiaClinicaRepository.save(historiaClinica);
    }
    
    public void deleteById(Long id) {
        historiaClinicaRepository.deleteById(id);
    }
    
    public List<HistoriaClinica> findByVeterinariaId(Long veterinariaId) {
        return historiaClinicaRepository.findByVeterinariaId(veterinariaId);
    }
}