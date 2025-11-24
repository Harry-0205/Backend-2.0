package com.veterinaria.veterinaria.service;

import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CitaService {
    
    @Autowired
    private CitaRepository citaRepository;
    
    public List<Cita> findAll() {
        return citaRepository.findAll();
    }
    
    public List<Cita> findAllWithRelations() {
        return citaRepository.findAllWithRelations();
    }

    public java.util.Optional<Cita> findByIdWithRelations(Long id) {
        return citaRepository.findByIdWithRelations(id);
    }
    
    public Page<Cita> findAll(Pageable pageable) {
        return citaRepository.findAll(pageable);
    }
    
    public Optional<Cita> findById(Long id) {
        return citaRepository.findById(id);
    }
    
    public List<Cita> findByClienteDocumento(String clienteDocumento) {
        return citaRepository.findByClienteDocumentoWithRelations(clienteDocumento);
    }
    
    public List<Cita> findByVeterinarioDocumento(String veterinarioDocumento) {
        return citaRepository.findByVeterinarioDocumentoWithRelations(veterinarioDocumento);
    }
    
    public List<Cita> findByMascotaId(Long mascotaId) {
        return citaRepository.findByMascotaIdWithRelations(mascotaId);
    }
    
    public List<Cita> findByEstado(Cita.EstadoCita estado) {
        return citaRepository.findByEstadoWithRelations(estado);
    }
    
    public List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return citaRepository.findByFechaHoraBetweenWithRelations(inicio, fin);
    }
    
    public List<Cita> findByFechaAndVeterinario(LocalDateTime inicio, LocalDateTime fin, String veterinarioDocumento) {
        return citaRepository.findByFechaHoraBetweenAndVeterinarioDocumentoWithRelations(inicio, fin, veterinarioDocumento);
    }
    
    public List<Cita> findCitasDeHoy() {
        return citaRepository.findCitasDeHoyWithRelations();
    }
    
    public Cita save(Cita cita) {
        return citaRepository.save(cita);
    }
    
    public Cita update(Cita cita) {
        return citaRepository.save(cita);
    }
    
    public void deleteById(Long id) {
        citaRepository.deleteById(id);
    }
    
    public Cita updateEstado(Long id, Cita.EstadoCita nuevoEstado) {
        Optional<Cita> cita = citaRepository.findById(id);
        if (cita.isPresent()) {
            cita.get().setEstado(nuevoEstado);
            return citaRepository.save(cita.get());
        }
        throw new RuntimeException("Cita no encontrada con ID: " + id);
    }
    
    public Cita cancelarCita(Long id) {
        return updateEstado(id, Cita.EstadoCita.CANCELADA);
    }
    
    public Cita confirmarCita(Long id) {
        return updateEstado(id, Cita.EstadoCita.CONFIRMADA);
    }
    
    public Cita completarCita(Long id) {
        return updateEstado(id, Cita.EstadoCita.COMPLETADA);
    }
    
    public long count() {
        return citaRepository.count();
    }
    
    public long countCitasHoy() {
        return citaRepository.findCitasDeHoy().size();
    }
    
    public long countByEstado(Cita.EstadoCita estado) {
        return citaRepository.countByEstado(estado);
    }
    
    public List<Cita> findByVeterinariaId(Long veterinariaId) {
        return citaRepository.findByVeterinariaId(veterinariaId);
    }
}