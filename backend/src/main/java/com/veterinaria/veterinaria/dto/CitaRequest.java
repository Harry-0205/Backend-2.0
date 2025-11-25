package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Cita.EstadoCita;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CitaRequest {
    
    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;
    
    private String motivo;
    
    @NotNull(message = "El ID de la mascota es obligatorio")
    private Long mascotaId;
    
    @NotNull(message = "El documento del cliente es obligatorio")
    private String clienteDocumento;
    
    private String veterinarioDocumento;
    
    private Long veterinariaId;
    
    private String observaciones;
    
    private EstadoCita estado;
    
    // Constructores
    public CitaRequest() {}
    
    public CitaRequest(LocalDateTime fechaHora, String motivo, Long mascotaId, String clienteDocumento, String veterinarioDocumento) {
        this.fechaHora = fechaHora;
        this.motivo = motivo;
        this.mascotaId = mascotaId;
        this.clienteDocumento = clienteDocumento;
        this.veterinarioDocumento = veterinarioDocumento;
    }
    
    // Getters y Setters
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
    
    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
    
    public String getMotivo() {
        return motivo;
    }
    
    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
    
    public Long getMascotaId() {
        return mascotaId;
    }
    
    public void setMascotaId(Long mascotaId) {
        this.mascotaId = mascotaId;
    }
    
    public String getClienteDocumento() {
        return clienteDocumento;
    }
    
    public void setClienteDocumento(String clienteDocumento) {
        this.clienteDocumento = clienteDocumento;
    }
    
    public String getVeterinarioDocumento() {
        return veterinarioDocumento;
    }
    
    public void setVeterinarioDocumento(String veterinarioDocumento) {
        this.veterinarioDocumento = veterinarioDocumento;
    }
    
    public Long getVeterinariaId() {
        return veterinariaId;
    }
    
    public void setVeterinariaId(Long veterinariaId) {
        this.veterinariaId = veterinariaId;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public EstadoCita getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoCita estado) {
        this.estado = estado;
    }
}