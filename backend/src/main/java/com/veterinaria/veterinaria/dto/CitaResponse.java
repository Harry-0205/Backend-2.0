package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Cita;
import java.time.LocalDateTime;

public class CitaResponse {
    private Long id;
    private LocalDateTime fechaHora;
    private String motivo;
    private String observaciones;
    private String estado;
    private LocalDateTime fechaCreacion;
    
    // Información del cliente
    private String clienteDocumento;
    private String clienteNombre;
    private String clienteApellido;
    
    // Información de la mascota
    private Long mascotaId;
    private String mascotaNombre;
    private String mascotaEspecie;
    
    // Información del veterinario
    private String veterinarioDocumento;
    private String veterinarioNombre;
    private String veterinarioApellido;
    
    // Información de la veterinaria
    private Long veterinariaId;
    private String veterinariaNombre;
    
    // Constructor desde entidad
    public CitaResponse(Cita cita) {
        try {
            this.id = cita.getId();
            this.fechaHora = cita.getFechaHora();
            this.motivo = cita.getMotivo();
            this.observaciones = cita.getObservaciones();
            this.estado = cita.getEstado() != null ? cita.getEstado().name() : null;
            this.fechaCreacion = cita.getFechaCreacion();
            
            // Cliente
            try {
                if (cita.getCliente() != null) {
                    this.clienteDocumento = cita.getCliente().getDocumento();
                    this.clienteNombre = cita.getCliente().getNombres();
                    this.clienteApellido = cita.getCliente().getApellidos();
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando cliente de cita " + cita.getId() + ": " + e.getMessage());
            }
            
            // Mascota
            try {
                if (cita.getMascota() != null) {
                    this.mascotaId = cita.getMascota().getId();
                    this.mascotaNombre = cita.getMascota().getNombre();
                    this.mascotaEspecie = cita.getMascota().getEspecie();
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando mascota de cita " + cita.getId() + ": " + e.getMessage());
            }
            
            // Veterinario
            try {
                if (cita.getVeterinario() != null) {
                    this.veterinarioDocumento = cita.getVeterinario().getDocumento();
                    this.veterinarioNombre = cita.getVeterinario().getNombres();
                    this.veterinarioApellido = cita.getVeterinario().getApellidos();
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando veterinario de cita " + cita.getId() + ": " + e.getMessage());
            }
            
            // Veterinaria
            try {
                if (cita.getVeterinaria() != null) {
                    this.veterinariaId = cita.getVeterinaria().getId();
                    this.veterinariaNombre = cita.getVeterinaria().getNombre();
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando veterinaria de cita " + cita.getId() + ": " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR CRÍTICO en CitaResponse para cita " + (cita != null ? cita.getId() : "null") + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public String getClienteDocumento() { return clienteDocumento; }
    public void setClienteDocumento(String clienteDocumento) { this.clienteDocumento = clienteDocumento; }
    
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    
    public String getClienteApellido() { return clienteApellido; }
    public void setClienteApellido(String clienteApellido) { this.clienteApellido = clienteApellido; }
    
    public Long getMascotaId() { return mascotaId; }
    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }
    
    public String getMascotaNombre() { return mascotaNombre; }
    public void setMascotaNombre(String mascotaNombre) { this.mascotaNombre = mascotaNombre; }
    
    public String getMascotaEspecie() { return mascotaEspecie; }
    public void setMascotaEspecie(String mascotaEspecie) { this.mascotaEspecie = mascotaEspecie; }
    
    public String getVeterinarioDocumento() { return veterinarioDocumento; }
    public void setVeterinarioDocumento(String veterinarioDocumento) { this.veterinarioDocumento = veterinarioDocumento; }
    
    public String getVeterinarioNombre() { return veterinarioNombre; }
    public void setVeterinarioNombre(String veterinarioNombre) { this.veterinarioNombre = veterinarioNombre; }
    
    public String getVeterinarioApellido() { return veterinarioApellido; }
    public void setVeterinarioApellido(String veterinarioApellido) { this.veterinarioApellido = veterinarioApellido; }
    
    public Long getVeterinariaId() { return veterinariaId; }
    public void setVeterinariaId(Long veterinariaId) { this.veterinariaId = veterinariaId; }
    
    public String getVeterinariaNombre() { return veterinariaNombre; }
    public void setVeterinariaNombre(String veterinariaNombre) { this.veterinariaNombre = veterinariaNombre; }
}
