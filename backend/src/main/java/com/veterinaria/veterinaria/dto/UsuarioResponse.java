package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Usuario;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class UsuarioResponse {
    private String documento;
    private String username;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String direccion;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private LocalDateTime fechaRegistro;
    private boolean activo;
    private List<String> roles;
    private Long veterinariaId;
    private String veterinariaNombre;
    
    // Constructor
    public UsuarioResponse(Usuario usuario) {
        this.documento = usuario.getDocumento();
        this.username = usuario.getUsername();
        this.nombres = usuario.getNombres();
        this.apellidos = usuario.getApellidos();
        this.email = usuario.getEmail();
        this.telefono = usuario.getTelefono();
        this.direccion = usuario.getDireccion();
        this.tipoDocumento = usuario.getTipoDocumento();
        this.fechaNacimiento = usuario.getFechaNacimiento();
        this.fechaRegistro = usuario.getFechaRegistro();
        this.activo = usuario.getActivo() != null ? usuario.getActivo() : false;
        
        // Solo los nombres de los roles, sin toda la información del rol
        this.roles = usuario.getRoles() != null ? 
            usuario.getRoles().stream()
                .map(role -> role.getNombre())
                .collect(Collectors.toList()) : 
            List.of();
        
        // Información de la veterinaria (si es veterinario)
        if (usuario.getVeterinaria() != null) {
            this.veterinariaId = usuario.getVeterinaria().getId();
            this.veterinariaNombre = usuario.getVeterinaria().getNombre();
        }
    }
    
    // Getters
    public String getDocumento() { return documento; }
    public String getUsername() { return username; }
    public String getNombres() { return nombres; }
    public String getApellidos() { return apellidos; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public String getDireccion() { return direccion; }
    public String getTipoDocumento() { return tipoDocumento; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public boolean isActivo() { return activo; }
    public List<String> getRoles() { return roles; }
    public Long getVeterinariaId() { return veterinariaId; }
    public String getVeterinariaNombre() { return veterinariaNombre; }
}