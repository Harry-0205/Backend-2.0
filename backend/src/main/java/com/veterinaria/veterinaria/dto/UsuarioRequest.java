package com.veterinaria.veterinaria.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class UsuarioRequest {
    private String documento;
    private String username;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String direccion;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private Boolean activo;
    private List<String> roles; // Array de nombres de roles como strings
    private String password;
    private Long veterinariaId; // ID de la veterinaria para veterinarios
    
    // Constructor vacío
    public UsuarioRequest() {}
    
    // Getters y Setters
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
    
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Long getVeterinariaId() { return veterinariaId; }
    public void setVeterinariaId(Long veterinariaId) { this.veterinariaId = veterinariaId; }
}