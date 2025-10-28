package com.veterinaria.veterinaria.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CitaRequest {
    
    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;
    
    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;
    
    @NotNull(message = "El ID de la mascota es obligatorio")
    private Long mascotaId;
    
    @NotBlank(message = "El documento del veterinario es obligatorio")
    private String veterinarioDocumento;
    
    private String observaciones;
    
    // Constructores
    public CitaRequest() {}
    
    public CitaRequest(LocalDateTime fechaHora, String motivo, Long mascotaId, String veterinarioDocumento) {
        this.fechaHora = fechaHora;
        this.motivo = motivo;
        this.mascotaId = mascotaId;
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
    
    public String getVeterinarioDocumento() {
        return veterinarioDocumento;
    }
    
    public void setVeterinarioDocumento(String veterinarioDocumento) {
        this.veterinarioDocumento = veterinarioDocumento;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}