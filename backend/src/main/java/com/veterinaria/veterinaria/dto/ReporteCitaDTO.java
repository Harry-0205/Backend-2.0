package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Cita;
import java.time.LocalDateTime;

public class ReporteCitaDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private String motivo;
    private String estado;
    private String clienteDocumento;
    private String clienteNombre;
    private Long mascotaId;
    private String mascotaNombre;
    private String mascotaEspecie;
    private String veterinarioDocumento;
    private String veterinarioNombre;
    private String veterinariaNombre;
    private LocalDateTime fechaCreacion;

    public ReporteCitaDTO() {
    }

    public ReporteCitaDTO(Cita cita) {
        this.id = cita.getId();
        this.fechaHora = cita.getFechaHora();
        this.motivo = cita.getMotivo();
        this.estado = cita.getEstado() != null ? cita.getEstado().name() : null;
        this.fechaCreacion = cita.getFechaCreacion();

        // Datos del cliente
        if (cita.getCliente() != null) {
            this.clienteDocumento = cita.getCliente().getDocumento();
            this.clienteNombre = cita.getCliente().getNombres() + " " + cita.getCliente().getApellidos();
        }

        // Datos de la mascota
        if (cita.getMascota() != null) {
            this.mascotaId = cita.getMascota().getId();
            this.mascotaNombre = cita.getMascota().getNombre();
            this.mascotaEspecie = cita.getMascota().getEspecie();
        }

        // Datos del veterinario
        if (cita.getVeterinario() != null) {
            this.veterinarioDocumento = cita.getVeterinario().getDocumento();
            this.veterinarioNombre = cita.getVeterinario().getNombres() + " " + cita.getVeterinario().getApellidos();
        }

        // Datos de la veterinaria
        if (cita.getVeterinaria() != null) {
            this.veterinariaNombre = cita.getVeterinaria().getNombre();
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getClienteDocumento() {
        return clienteDocumento;
    }

    public void setClienteDocumento(String clienteDocumento) {
        this.clienteDocumento = clienteDocumento;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public Long getMascotaId() {
        return mascotaId;
    }

    public void setMascotaId(Long mascotaId) {
        this.mascotaId = mascotaId;
    }

    public String getMascotaNombre() {
        return mascotaNombre;
    }

    public void setMascotaNombre(String mascotaNombre) {
        this.mascotaNombre = mascotaNombre;
    }

    public String getMascotaEspecie() {
        return mascotaEspecie;
    }

    public void setMascotaEspecie(String mascotaEspecie) {
        this.mascotaEspecie = mascotaEspecie;
    }

    public String getVeterinarioDocumento() {
        return veterinarioDocumento;
    }

    public void setVeterinarioDocumento(String veterinarioDocumento) {
        this.veterinarioDocumento = veterinarioDocumento;
    }

    public String getVeterinarioNombre() {
        return veterinarioNombre;
    }

    public void setVeterinarioNombre(String veterinarioNombre) {
        this.veterinarioNombre = veterinarioNombre;
    }

    public String getVeterinariaNombre() {
        return veterinariaNombre;
    }

    public void setVeterinariaNombre(String veterinariaNombre) {
        this.veterinariaNombre = veterinariaNombre;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
