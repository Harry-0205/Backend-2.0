package com.veterinaria.veterinaria.dto;

import java.time.LocalDateTime;

public class HorarioDisponibleDTO {
    private LocalDateTime fechaHora;
    private boolean disponible;
    private String veterinarioNombre;
    private String veterinarioDocumento;

    public HorarioDisponibleDTO() {}

    public HorarioDisponibleDTO(LocalDateTime fechaHora, boolean disponible) {
        this.fechaHora = fechaHora;
        this.disponible = disponible;
    }

    public HorarioDisponibleDTO(LocalDateTime fechaHora, boolean disponible, String veterinarioNombre, String veterinarioDocumento) {
        this.fechaHora = fechaHora;
        this.disponible = disponible;
        this.veterinarioNombre = veterinarioNombre;
        this.veterinarioDocumento = veterinarioDocumento;
    }

    // Getters y Setters
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public String getVeterinarioNombre() {
        return veterinarioNombre;
    }

    public void setVeterinarioNombre(String veterinarioNombre) {
        this.veterinarioNombre = veterinarioNombre;
    }

    public String getVeterinarioDocumento() {
        return veterinarioDocumento;
    }

    public void setVeterinarioDocumento(String veterinarioDocumento) {
        this.veterinarioDocumento = veterinarioDocumento;
    }
}
