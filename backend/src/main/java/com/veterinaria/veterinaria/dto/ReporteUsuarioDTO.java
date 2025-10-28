package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Usuario;
import java.time.LocalDateTime;

public class ReporteUsuarioDTO {
    private String documento;
    private String username;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String rol;
    private Boolean activo;
    private LocalDateTime fechaRegistro;
    private Long totalMascotas;
    private Long totalCitas;

    public ReporteUsuarioDTO() {
    }

    public ReporteUsuarioDTO(Usuario usuario, Long totalMascotas, Long totalCitas) {
        this.documento = usuario.getDocumento();
        this.username = usuario.getUsername();
        this.nombres = usuario.getNombres();
        this.apellidos = usuario.getApellidos();
        this.email = usuario.getEmail();
        this.telefono = usuario.getTelefono();
        this.activo = usuario.getActivo();
        this.fechaRegistro = usuario.getFechaRegistro();
        this.totalMascotas = totalMascotas != null ? totalMascotas : 0L;
        this.totalCitas = totalCitas != null ? totalCitas : 0L;
        
        // Obtener el primer rol del usuario
        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            this.rol = usuario.getRoles().stream()
                    .findFirst()
                    .map(r -> r.getNombre())
                    .orElse("SIN_ROL");
        } else {
            this.rol = "SIN_ROL";
        }
    }

    // Getters y Setters
    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Long getTotalMascotas() {
        return totalMascotas;
    }

    public void setTotalMascotas(Long totalMascotas) {
        this.totalMascotas = totalMascotas;
    }

    public Long getTotalCitas() {
        return totalCitas;
    }

    public void setTotalCitas(Long totalCitas) {
        this.totalCitas = totalCitas;
    }
}
